// Mock API with realistic delays and responses
// All authentication functions return promises

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for mock data
const mockUsers: Record<string, any> = {};
const mockTokens: Record<string, any> = {};
const mockOTPs: Record<string, { code: string; expires: number }> = {};
const resendCooldowns: Record<string, number> = {};

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface RefreshData {
  refreshToken: string;
}

// Register new user
export const register = async (data: RegisterData) => {
  await delay(800);

  if (mockUsers[data.email]) {
    throw new Error('Email already registered');
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  mockUsers[data.email] = {
    ...data,
    verified: false,
    createdAt: new Date().toISOString()
  };

  mockOTPs[data.email] = {
    code: otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  console.log(`[MOCK] OTP for ${data.email}: ${otp}`);

  return {
    success: true,
    message: 'Registration successful. Please verify your email.',
    user: {
      email: data.email,
      name: data.name
    }
  };
};

// Login user
export const login = async (data: LoginData) => {
  await delay(600);

  const user = mockUsers[data.email];
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.password !== data.password) {
    throw new Error('Invalid credentials');
  }

  if (!user.verified) {
    throw new Error('Please verify your email first');
  }

  const accessToken = `mock_access_${Date.now()}`;
  const refreshToken = `mock_refresh_${Date.now()}`;

  mockTokens[accessToken] = {
    email: data.email,
    expires: Date.now() + 60 * 60 * 1000 // 1 hour
  };

  return {
    success: true,
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      name: user.name
    }
  };
};

// Verify email with 6-digit OTP
export const verifyEmail = async (data: VerifyEmailData) => {
  await delay(500);

  const user = mockUsers[data.email];
  if (!user) {
    throw new Error('User not found');
  }

  const otp = mockOTPs[data.email];
  if (!otp) {
    throw new Error('No verification code found. Please request a new one.');
  }

  if (Date.now() > otp.expires) {
    throw new Error('Verification code expired. Please request a new one.');
  }

  if (otp.code !== data.code) {
    throw new Error('Invalid verification code');
  }

  user.verified = true;
  delete mockOTPs[data.email];

  return {
    success: true,
    message: 'Email verified successfully!'
  };
};

// Resend verification code with cooldown
export const resendVerification = async (data: ResendVerificationData) => {
  await delay(500);

  const user = mockUsers[data.email];
  if (!user) {
    throw new Error('User not found');
  }

  if (user.verified) {
    throw new Error('Email already verified');
  }

  // Check cooldown (60 seconds)
  const lastSent = resendCooldowns[data.email];
  if (lastSent && Date.now() - lastSent < 60000) {
    const waitTime = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
    throw new Error(`Please wait ${waitTime} seconds before requesting a new code`);
  }

  // Generate new 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  mockOTPs[data.email] = {
    code: otp,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  resendCooldowns[data.email] = Date.now();

  console.log(`[MOCK] New OTP for ${data.email}: ${otp}`);

  return {
    success: true,
    message: 'Verification code sent! Check the console for the code.'
  };
};

// Forgot password
export const forgotPassword = async (data: ForgotPasswordData) => {
  await delay(600);

  const user = mockUsers[data.email];
  if (!user) {
    // Don't reveal if email exists
    return {
      success: true,
      message: 'If the email exists, a reset code has been sent.'
    };
  }

  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  mockOTPs[`reset_${data.email}`] = {
    code: resetCode,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes
  };

  console.log(`[MOCK] Reset code for ${data.email}: ${resetCode}`);

  return {
    success: true,
    message: 'If the email exists, a reset code has been sent.'
  };
};

// Reset password
export const resetPassword = async (data: ResetPasswordData) => {
  await delay(600);

  const user = mockUsers[data.email];
  if (!user) {
    throw new Error('Invalid reset request');
  }

  const resetOTP = mockOTPs[`reset_${data.email}`];
  if (!resetOTP) {
    throw new Error('No reset code found. Please request a new one.');
  }

  if (Date.now() > resetOTP.expires) {
    throw new Error('Reset code expired. Please request a new one.');
  }

  if (resetOTP.code !== data.code) {
    throw new Error('Invalid reset code');
  }

  user.password = data.newPassword;
  delete mockOTPs[`reset_${data.email}`];

  return {
    success: true,
    message: 'Password reset successfully!'
  };
};

// Refresh access token
export const refresh = async (data: RefreshData) => {
  await delay(300);

  // Simple mock refresh
  const newAccessToken = `mock_access_${Date.now()}`;
  
  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: data.refreshToken
  };
};

// Get current user
export const me = async (accessToken: string) => {
  await delay(300);

  const tokenData = mockTokens[accessToken];
  if (!tokenData) {
    throw new Error('Invalid token');
  }

  if (Date.now() > tokenData.expires) {
    throw new Error('Token expired');
  }

  const user = mockUsers[tokenData.email];
  if (!user) {
    throw new Error('User not found');
  }

  return {
    success: true,
    user: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  };
};
