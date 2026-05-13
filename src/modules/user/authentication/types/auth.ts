export interface LoginFormData {
    identifier: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    password2: string;
}

// ✅ Allow File during submission
export interface UpdateProfileFormData {
  first_name: string;
  last_name: string;
  profilePicture: File | string | null; // ✅ Accept File for upload
}

// ✅ Response type (what you get from API)
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profilePicture: string | null; // Always a URL in response
}



export interface ProfileUserDTO {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profilePicture: string | null;
}



// For changing password
export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  new_password2: string;
}

// For changing username
export interface ChangeUsernameFormData {
  password: string;            // confirmation password
  new_username: string;
}

// For changing email
export interface ChangeEmailFormData {
  password: string;            // confirmation password
  new_email: string;
}

// For soft-delete / delete with password
export interface DeleteAccountFormData {
  password: string;
}