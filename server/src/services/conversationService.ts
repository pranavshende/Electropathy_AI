import { prisma } from '../db/prisma.js';

class ConversationService {
  private inMemoryConversations: any[] = [];

  /**
   * List conversations belonging to the authenticated user
   */
  async listUserConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    try {
      const [total, conversations] = await Promise.all([
        prisma.conversation.count({
          where: { userId, isDeleted: false }
        }),
        prisma.conversation.findMany({
          where: { userId, isDeleted: false },
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { messages: true }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { content: true, role: true, createdAt: true }
            }
          }
        })
      ]);

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        conversations: conversations.map(c => ({
          id: c.id,
          title: c.title || 'Untitled Consultation',
          language: c.language,
          messageCount: c._count.messages,
          lastMessage: c.messages[0] || null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }))
      };
    } catch {
      const filtered = this.inMemoryConversations.filter(c => c.userId === userId && !c.isDeleted);
      return {
        total: filtered.length,
        page: 1,
        limit,
        totalPages: 1,
        conversations: filtered.map(c => ({
          id: c.id,
          title: c.title,
          language: c.language,
          messageCount: c.messages?.length || 0,
          lastMessage: c.messages?.[c.messages.length - 1] || null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }))
      };
    }
  }

  /**
   * Create a new conversation for authenticated user
   */
  async createConversation(userId: string, data: { title?: string; language?: string; initialMessage?: string }) {
    const title = data.title?.trim() || (data.initialMessage ? data.initialMessage.slice(0, 40) + '...' : 'New Consultation');
    const language = data.language || 'en';

    try {
      return await prisma.$transaction(async (tx) => {
        const conv = await tx.conversation.create({
          data: {
            userId,
            title,
            language,
            isDeleted: false
          }
        });

        if (data.initialMessage) {
          await tx.message.create({
            data: {
              conversationId: conv.id,
              role: 'user',
              content: data.initialMessage
            }
          });
        }

        return conv;
      });
    } catch {
      const newConv = {
        id: 'conv-' + Date.now().toString(36),
        userId,
        title,
        language,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: data.initialMessage ? [{
          id: 'msg-' + Date.now().toString(36),
          role: 'user',
          content: data.initialMessage,
          createdAt: new Date()
        }] : []
      };
      this.inMemoryConversations.unshift(newConv);
      return newConv;
    }
  }

  /**
   * Get a conversation and its message history (Strict ownership check!)
   */
  async getConversation(userId: string, conversationId: string) {
    try {
      const conv = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
          isDeleted: false
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conv) {
        return null;
      }

      return conv;
    } catch {
      const local = this.inMemoryConversations.find(c => c.id === conversationId && c.userId === userId && !c.isDeleted);
      return local || null;
    }
  }

  /**
   * Update conversation title (Strict ownership check!)
   */
  async updateTitle(userId: string, conversationId: string, title: string) {
    const existing = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, isDeleted: false }
    });

    if (!existing) return null;

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title: title.trim() }
    });
  }

  /**
   * Soft-delete a conversation (Strict ownership check!)
   */
  async softDelete(userId: string, conversationId: string) {
    const existing = await prisma.conversation.findFirst({
      where: { id: conversationId, userId, isDeleted: false }
    });

    if (!existing) return null;

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { isDeleted: true }
    });
  }

  /**
   * Add a message to a conversation (Strict ownership check & atomic timestamp touch)
   */
  async addMessage(
    userId: string,
    conversationId: string,
    messageData: { role: 'user' | 'assistant' | 'system'; content: string; feedback?: string; metadata?: any }
  ) {
    try {
      const conv = await prisma.conversation.findFirst({
        where: { id: conversationId, userId, isDeleted: false }
      });

      if (!conv) return null;

      return await prisma.$transaction(async (tx) => {
        const newMsg = await tx.message.create({
          data: {
            conversationId,
            role: messageData.role,
            content: messageData.content,
            feedback: messageData.feedback || null,
            metadata: messageData.metadata || null
          }
        });

        // Touch updatedAt on conversation
        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        return newMsg;
      });
    } catch {
      const localConv = this.inMemoryConversations.find(c => c.id === conversationId && c.userId === userId);
      const mockMsg = {
        id: 'msg-' + Date.now().toString(36),
        conversationId,
        role: messageData.role,
        content: messageData.content,
        feedback: messageData.feedback || null,
        metadata: messageData.metadata || null,
        createdAt: new Date()
      };
      if (localConv) {
        if (!localConv.messages) localConv.messages = [];
        localConv.messages.push(mockMsg);
        localConv.updatedAt = new Date();
      }
      return mockMsg;
    }
  }

  /**
   * ADMIN: List all conversations across all users with search
   */
  async listAllForAdmin(params: { search?: string; userId?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { user: { mobileNumber: { contains: params.search } } },
      ];
    }

    let total = 0;
    let conversations: any[] = [];

    try {
      const [t, c] = await Promise.all([
        prisma.conversation.count({ where }),
        prisma.conversation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            user: {
              select: { id: true, fullName: true, mobileNumber: true, role: true }
            },
            _count: {
              select: { messages: true }
            }
          }
        })
      ]);
      total = t;
      conversations = c;
    } catch {
      // In-memory fallback
      const inMem = this.inMemoryConversations.map(c => ({
        id: c.id,
        userId: c.userId,
        title: c.title,
        language: c.language || 'en',
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        user: {
          id: c.userId,
          fullName: 'Dr. Ashish Wandhare (Demo Patient)',
          mobileNumber: '+918421358609',
          role: 'patient'
        },
        _count: {
          messages: c.messages?.length || 2
        }
      }));
      conversations = inMem;
      total = inMem.length;
    }

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      conversations
    };
  }

  /**
   * ADMIN: Get single conversation messages with user info
   */
  async getAdminConversation(conversationId: string) {
    try {
      return await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          user: {
            select: { id: true, fullName: true, mobileNumber: true, role: true }
          },
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    } catch {
      const mem = this.inMemoryConversations.find(c => c.id === conversationId);
      if (mem) {
        return {
          ...mem,
          user: {
            id: mem.userId,
            fullName: 'Dr. Ashish Wandhare (Demo Patient)',
            mobileNumber: '+918421358609',
            role: 'patient'
          }
        };
      }
      return null;
    }
  }
}

export const conversationService = new ConversationService();
