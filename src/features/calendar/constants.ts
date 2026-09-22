export const CALENDAR_PAGE_TITLE = 'Календар';
export const CALENDAR_LOAD_ERROR =
  'Не вдалося завантажити календар. Перевірте інтернет і спробуйте ще раз.';
export const CALENDAR_RETRY_TITLE = 'Спробувати ще раз';
export const EMPTY_WEEK_TITLE = 'На цей тиждень уроків немає';
export const EMPTY_DAY_TITLE = 'На цей день уроків немає';
export const COLORS_TITLE = 'Що означають кольори?';
export const JOIN_LESSON_TITLE = 'Підключитися до Zoom';
export const JOINING_LESSON_TITLE = 'Підключення…';
export const OPEN_ZOOM_APP_TITLE = 'Відкрити у Zoom';
export const JOIN_HINT =
  'Кнопка стане активною за 15 хвилин до початку уроку';
export const PAY_LESSON_TITLE = 'Оплатити заняття';
export const SDK_NOT_READY_TITLE = 'Zoom ще не готовий';
export const SDK_NOT_READY_MESSAGE =
  'Зачекайте кілька секунд і спробуйте ще раз.';
export const JWT_MISSING_TITLE = 'Zoom SDK не налаштований';
export const JWT_MISSING_MESSAGE =
  'Додайте ZOOM JWT у конфіг застосунку, щоб підключатися до уроків.';
export const PERMISSIONS_TITLE = 'Камера і мікрофон';
export const PERMISSIONS_MESSAGE =
  'Дозвольте камеру і мікрофон, щоб підключитися до уроку.';
export const JOIN_FAILED_TITLE = 'Не вдалося підключитися';
export const INVALID_LINK_TITLE = 'Немає посилання на Zoom';
export const INVALID_LINK_MESSAGE =
  'У цьому уроці ще немає посилання на конференцію.';

export const JOIN_WINDOW_MINUTES = 15;
export const WEEK_SHADOW = '0 0 12px 0 rgba(0, 0, 0, 0.12)';

export const WEEKDAY_LABELS: Record<string, string> = {
  Monday: 'п',
  Tuesday: 'в',
  Wednesday: 'с',
  Thursday: 'ч',
  Friday: 'п',
  Saturday: 'с',
  Sunday: 'н',
};

export const MONTH_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

export const COLOR_LEGEND = [
  { color: '#66B314', label: 'проведені та заплановані заняття' },
  { color: '#FFE68F', label: 'безкоштовний пробний урок' },
  { color: '#C7E8AA', label: 'вільний час репетитора' },
  { color: '#E3E3E3', label: 'недоступний час репетитора' },
  { color: '#C70239', label: 'заняття заплановане, але ще неоплачене' },
  {
    color: '#D51B1D',
    label:
      'заняття було відмінене учнем менше, ніж за 4 години до початку уроку',
  },
];
