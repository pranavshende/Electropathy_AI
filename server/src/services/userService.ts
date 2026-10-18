import { prisma } from '../db/prisma.js';
import { User, UserType, PreferredLang } from '../types/index.js';

class UserService {
  async findByMobile(mobileNumber: string): Promise<User | null> {
    const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);
    const user = await prisma.user.findUnique({
      where: { mobileNumber: cleanNumber }
    });
    if (!user) return null;

    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      userType: (user.userType as UserType) || undefined,
      preferredLang: user.preferredLang as PreferredLang,
      role: user.role as any,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) return null;

    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      userType: (user.userType as UserType) || undefined,
      preferredLang: user.preferredLang as PreferredLang,
      role: user.role as any,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createFromMobile(mobileNumber: string): Promise<User> {
    const cleanNumber = mobileNumber.replace(/\D/g, '').slice(-10);

    const user = await prisma.user.create({
      data: {
        mobileNumber: cleanNumber,
        preferredLang: 'en',
        role: 'patient',
        isActive: true,
      }
    });

    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      userType: (user.userType as UserType) || undefined,
      preferredLang: user.preferredLang as PreferredLang,
      role: user.role as any,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(
    userId: string,
    updates: {
      fullName?: string;
      email?: string;
      userType?: UserType;
      preferredLang?: PreferredLang;
    }
  ): Promise<User> {
    const dataToUpdate: any = {};
    if (updates.fullName !== undefined) dataToUpdate.fullName = updates.fullName;
    if (updates.email !== undefined) dataToUpdate.email = updates.email;
    if (updates.userType !== undefined) {
      dataToUpdate.userType = updates.userType;
      if (updates.userType === 'practitioner') {
        dataToUpdate.role = 'practitioner';
      }
    }
    if (updates.preferredLang !== undefined) dataToUpdate.preferredLang = updates.preferredLang;

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return {
      id: user.id,
      mobileNumber: user.mobileNumber,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      userType: (user.userType as UserType) || undefined,
      preferredLang: user.preferredLang as PreferredLang,
      role: user.role as any,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
