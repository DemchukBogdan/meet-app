// libraries
import type { MobileRTCAuthError } from '@zoom/meetingsdk-react-native';

export const AUTH_SUCCESS_ERRORS = new Set<MobileRTCAuthError>([
  'ZOOM_ERROR_SUCCESS',
  'MobileRTCAuthError_Success',
]);

export const DEFAULT_MEETING_TOPIC = 'Mobile app meeting';
export const DEFAULT_GUEST_NAME = 'Guest';
export const DEFAULT_HOST_NAME = 'Host';
export const ZOOM_SDK_DOMAIN = 'zoom.us';
export const ZOOM_SDK_LOG_SIZE = 5;
export const PLATE_SHADOW = '0 0 12px 2px rgba(0, 0, 0, 0.1)';

export const JOIN_AS_CLIENT_TITLE = 'Підключення до Zoom';
export const JOIN_AS_CLIENT_HINT =
  'Увійдіть як учень. Організатор зустрічі — репетитор.';
export const JOIN_AS_CLIENT_NAME_LABEL = 'Ваше імʼя';
export const JOIN_AS_CLIENT_MEETING_LABEL = 'Посилання або ID зустрічі';
export const JOIN_AS_CLIENT_PASSWORD_LABEL = 'Пароль (якщо є)';
export const JOIN_AS_CLIENT_BUTTON = 'Підключитися як учень';
export const JOIN_AS_CLIENT_LOADING = 'Підключення…';
export const JOIN_AS_CLIENT_INVALID =
  'Вкажіть номер зустрічі Zoom або посилання з календаря.';
export const JOIN_FAILED_TITLE = 'Не вдалося підключитися';
export const JWT_MISSING_TITLE = 'Zoom SDK не налаштований';
export const JWT_MISSING_MESSAGE =
  'Додайте ZOOM JWT у конфіг застосунку, щоб підключатися до уроків.';
export const PERMISSIONS_TITLE = 'Камера і мікрофон';
export const PERMISSIONS_MESSAGE =
  'Дозвольте камеру і мікрофон, щоб підключитися до уроку.';
export const SDK_NOT_READY_TITLE = 'Zoom ще не готовий';
export const SDK_NOT_READY_MESSAGE =
  'Зачекайте кілька секунд і спробуйте ще раз.';
