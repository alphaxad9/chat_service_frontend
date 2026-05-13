import { AxiosError } from 'axios';
import { LoginFormData, RegisterFormData, UpdateProfileFormData, UserProfile, ChangeEmailFormData, ChangePasswordFormData, ChangeUsernameFormData, DeleteAccountFormData } from '../../../modules/user/authentication/types/auth';
import { client } from '../../client';
// 1. Get CSRF Token
export const getCsrfToken = async (): Promise<string> => {
  try {
    const response = await client.get<{ csrfToken: string }>('/users/csrf/');
    return response.data.csrfToken;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('CSRF token fetch failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 2. Register
export const register = async (data: RegisterFormData): Promise<UserProfile> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.post<UserProfile>('/users/register/', data, {
      headers: { 'X-CSRFToken': csrfToken },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Registration failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 3. Login
export const login = async (data: LoginFormData): Promise<UserProfile> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.post<UserProfile>('/users/token/', data, {
      headers: { 'X-CSRFToken': csrfToken },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Login failed:', error.response?.data || error.message);
    }
    throw error;
  }
};


// 5. Token Refresh
export const refreshToken = async (): Promise<{ access: string; refresh: string }> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.post<{ access: string; refresh: string }>('/users/token/refresh/', {}, {
      headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Token refresh failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 6. Get Profile
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const csrfToken = await getCsrfToken();
    const response = await client.get('/users/profile/', {
      headers: { 'X-CSRFToken': csrfToken },
    });

    const user = response.data.user; // ✅ Access nested "user"

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      profilePicture: user.profile_picture,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Profile fetch failed:', error.response?.data || error.message);
    }
    throw error;
  }
};


// 7. Update Profile
export const updateProfile = async (data: UpdateProfileFormData): Promise<UserProfile> => {
  try {
    const csrfToken = await getCsrfToken();

    // 🔁 Map camelCase → snake_case
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      profile_picture: data.profilePicture,
    };

    const response = await client.patch<UserProfile>('/users/profile/update/', payload, {
      headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Profile update failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 8. Logout
export const logout = async (): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.post('/users/logout/', {}, {
      headers: { 'X-CSRFToken': csrfToken },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Logout failed:', error.response?.data || error.message);
    }
    throw error;
  }
};




// 9. Change Password
export const changePassword = async (data: ChangePasswordFormData): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.post('/users/change-password/', data, {
      headers: { 'X-CSRFToken': csrfToken },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Password change failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 10. Change Username
export const changeUsername = async (data: ChangeUsernameFormData): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.post('/users/change-username/', data, {
      headers: { 'X-CSRFToken': csrfToken },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Username change failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 11. Change Email
export const changeEmail = async (data: ChangeEmailFormData): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.post('/users/change-email/', data, {
      headers: { 'X-CSRFToken': csrfToken },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Email change failed:', error.response?.data || error.message);
    }
    throw error;
  }
};

// 12. Delete Account (with password confirmation)
export const deleteAccount = async (data: DeleteAccountFormData): Promise<void> => {
  try {
    const csrfToken = await getCsrfToken();
    await client.delete('/users/delete/', {
      data, // ✅ send payload in DELETE body (axios supports this)
      headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Account deletion failed:', error.response?.data || error.message);
    }
    throw error;
  }
};