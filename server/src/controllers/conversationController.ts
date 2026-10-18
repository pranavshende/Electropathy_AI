import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { conversationService } from '../services/conversationService.js';
import { auditService } from '../services/auditService.js';

export class ConversationController {
  /**
   * GET /api/conversations
   */
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await conversationService.listUserConversations(userId, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      console.error('[CONVERSATION list ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve conversations' });
    }
  }

  /**
   * POST /api/conversations
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { title, language, initialMessage } = req.body;
      const conv = await conversationService.createConversation(userId, {
        title,
        language: language || req.user?.preferredLang || 'en',
        initialMessage
      });

      // Record activity
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      await auditService.log(
        userId,
        'CONVERSATION_STARTED',
        conv.id,
        { title: conv.title, language: conv.language },
        ip
      );

      res.status(201).json({ success: true, conversation: conv });
    } catch (error: any) {
      console.error('[CONVERSATION create ERROR]', error);
      res.status(500).json({ success: false, message: 'Failed to start conversation' });
    }
  }

  /**
   * GET /api/conversations/:id
   */
  async getOne(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversationId = req.params.id as string;
      const conv = await conversationService.getConversation(userId, conversationId);

      if (!conv) {
        res.status(404).json({ success: false, message: 'Conversation not found or deleted' });
        return;
      }

      res.status(200).json({ success: true, conversation: conv });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
    }
  }

  /**
   * PATCH /api/conversations/:id
   */
  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversationId = req.params.id as string;
      const { title } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ success: false, message: 'Valid title string is required' });
        return;
      }

      const updated = await conversationService.updateTitle(userId, conversationId, title);

      if (!updated) {
        res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
        return;
      }

      res.status(200).json({ success: true, conversation: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update conversation' });
    }
  }

  /**
   * DELETE /api/conversations/:id
   */
  async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversationId = req.params.id as string;
      const deleted = await conversationService.softDelete(userId, conversationId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
        return;
      }

      res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete conversation' });
    }
  }

  /**
   * POST /api/conversations/:id/messages
   */
  async appendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversationId = req.params.id as string;
      const { role, content, feedback, metadata } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({ success: false, message: 'Message content is required' });
        return;
      }

      const msg = await conversationService.addMessage(userId, conversationId, {
        role: role === 'assistant' ? 'assistant' : 'user',
        content: content.trim(),
        feedback,
        metadata
      });

      if (!msg) {
        res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
        return;
      }

      res.status(201).json({ success: true, message: msg });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to add message' });
    }
  }
}

export const conversationController = new ConversationController();
