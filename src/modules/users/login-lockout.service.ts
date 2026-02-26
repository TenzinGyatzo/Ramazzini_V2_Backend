import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LoginLockout,
  LoginLockoutDocument,
} from './schemas/login-lockout.schema';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;

export interface LockoutStatus {
  locked: boolean;
  retryAfterSeconds?: number;
}

@Injectable()
export class LoginLockoutService {
  constructor(
    @InjectModel(LoginLockout.name)
    private loginLockoutModel: Model<LoginLockoutDocument>,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async getLockoutStatus(email: string): Promise<LockoutStatus> {
    const normalized = this.normalizeEmail(email);
    const doc = await this.loginLockoutModel
      .findOne({ email: normalized })
      .lean()
      .exec();
    if (!doc?.lockedUntil) return { locked: false };
    const now = new Date();
    if (doc.lockedUntil <= now) return { locked: false };
    const retryAfterSeconds = Math.ceil(
      (doc.lockedUntil.getTime() - now.getTime()) / 1000,
    );
    return { locked: true, retryAfterSeconds };
  }

  async recordFailedAttempt(email: string): Promise<void> {
    const normalized = this.normalizeEmail(email);
    const lockoutUntil = new Date();
    lockoutUntil.setMinutes(lockoutUntil.getMinutes() + LOCKOUT_MINUTES);

    const updated = await this.loginLockoutModel
      .findOneAndUpdate(
        { email: normalized },
        { $inc: { failedAttempts: 1 } },
        { new: true, upsert: true },
      )
      .exec();

    const newCount = updated?.failedAttempts ?? 1;
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      await this.loginLockoutModel
        .updateOne(
          { email: normalized },
          { $set: { lockedUntil: lockoutUntil } },
        )
        .exec();
    }
  }

  async clearLockout(email: string): Promise<void> {
    const normalized = this.normalizeEmail(email);
    await this.loginLockoutModel.deleteOne({ email: normalized }).exec();
  }
}
