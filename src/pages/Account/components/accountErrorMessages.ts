import type { TFunction } from 'i18next';

const errorKeyByServerMessage: Record<string, string> = {
  'Nickname must be 40 characters or fewer': 'account.errors.nicknameLength',
  'Avatar URL must be 2048 characters or fewer': 'account.errors.avatarLength',
  'Avatar URL must start with http:// or https://': 'account.errors.avatarProtocol',
  'Current password and new password are required': 'account.errors.passwordRequired',
  'New password must be at least 6 characters': 'account.errors.newPasswordLength',
  'Current password is incorrect': 'account.errors.currentPasswordIncorrect',
  'User not found': 'account.errors.userNotFound',
};

export const getAccountErrorMessage = (
  serverMessage: string | undefined,
  fallbackKey: string,
  t: TFunction,
) => t(serverMessage ? errorKeyByServerMessage[serverMessage] ?? fallbackKey : fallbackKey);
