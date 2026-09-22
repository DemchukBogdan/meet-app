export const BUKI_LOGO_URI =
  'https://bukischool.com.ua/img/logo-bukischool-by-buki_r.png';
export const BUKI_SUPPORT_EMAIL = 'school@buki.com.ua';
export const BUKI_TUTOR_LOGIN_URL = 'https://bukischool.com.ua/login';

export const PHONE_COUNTRY_PREFIX = '+38';
export const PHONE_MASK_PLACEHOLDER = 'ХХХ ХХХ-ХХ-ХХ';
export const PHONE_MAX_NATIONAL_DIGITS = 10;
export const AUTH_CODE_LENGTH = 6;
export const SMS_RESEND_COOLDOWN_MS = 60_000;

export const LOGIN_TITLE = 'Вхід в кабінет учня';
export const PHONE_LABEL = 'Телефон';
export const PASSWORD_LABEL = 'Пароль';
export const EMAIL_LABEL = 'Email';
export const SUBMIT_TITLE = 'Увійти';
export const OR_DIVIDER_LABEL = 'або';
export const GOOGLE_LOGIN_TITLE = 'Увійти за допомогою Google';
export const FORGOT_PASSWORD_TITLE = 'Забули пароль?';
export const SMS_LOGIN_TITLE = 'Увійти через код з SMS';
export const SMS_SHEET_TITLE = 'Вхід через код з SMS';
export const SMS_SUBMIT_TITLE = 'Отримати код';
export const SMS_CODE_LABEL = 'Введіть код';
export const SMS_SENT_MESSAGE =
  'Ми відправили вам код у Viber/SMS на ваш номер телефону';
export const SMS_RESEND_TITLE = 'Надіслати код ще раз';
export const SMS_RESEND_WAIT_PREFIX = 'Повторно відправити код можна буде через';
export const SMS_MINUTE_LABEL = 'хв';
export const SMS_SECOND_LABEL = 'сек';
export const EMAIL_SHEET_TITLE =
  'Введіть ваш email, на який вам буде надіслано пароль';
export const EMAIL_SUBMIT_TITLE = 'Отримати пароль';
export const HELP_TEXT =
  'Якщо у вас виникли проблеми з логінізацією - ви можете звернутися до нас по email:';
export const TUTOR_LOGIN_TITLE = 'Увійти в кабінет репетитора';
export const GENERIC_LOGIN_ERROR = '* Помилка в телефоні або паролі';

export const BUKI_LOGIN_ERROR_MESSAGES: Record<string, string> = {
  wrong_password: GENERIC_LOGIN_ERROR,
  no_client: '* Цей номер не зареєстрований як учень',
  client_not_found: '* Номер телефону не належить клієнту',
  already_authorized: '* Ви вже авторизовані як клієнт',
  min_max_error: '* Телефон має містити від 8 до 25 цифр',
  phone_is_required: '* Введіть номер телефону',
  phone_error: '* Помилка в номері телефону',
  auth_code_error: '* Невірний код',
  auth_code_lifetime_error: '* Код вже застарів',
  auth_request_time_remaining: '* Отримати код можливо пізніше',
  too_many_requests:
    '* Ви перевищили ліміт запитів. Наступна спроба не раніше, ніж через годину.',
  too_many_login_attempts:
    '* Забагато спроб входу. Спробуйте ще раз через 5 хвилин.',
};

export const BUKI_GREEN = '#66B314';
export const BUKI_FIELD_BG = '#F3F3F3';
export const BUKI_LABEL = '#ABACA9';
export const BUKI_ERROR = '#D51C1C';
export const BUKI_FLAG_BLUE = '#0057B7';
export const BUKI_FLAG_YELLOW = '#FFD700';
export const BUKI_DIVIDER = '#CCCCCC';
export const CARD_SHADOW = '0 0 12px 5px rgba(0, 0, 0, 0.1)';
export const HEADER_SHADOW = '0 0 12px 0 rgba(0, 0, 0, 0.22)';
export const OUTLINE_SHADOW = '0 0 12px 2px rgba(0, 0, 0, 0.12)';
export const GOOGLE_SHADOW = '0 0 12px 5px rgba(0, 0, 0, 0.15)';
