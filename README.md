# Meet

Застосунок для планування зустрічей: список, створення, RSVP і вхід. Мобільний клієнт (Expo) заходить у Zoom через SDK, веб показує ті самі дані й відкриває `join_url`.

Автентифікації немає: користувач моковий. Відеодзвінок у браузері не входить у скоуп, бо для нього потрібен окремий Zoom Web SDK.

## Стек

TypeScript (`strict`, `noUncheckedIndexedAccess`), React 19, RTK Query, Zod, tailwind-variants, i18next (uk/en), HeroUI + Tailwind на вебі, Expo SDK 57 на мобільному. pnpm workspaces і Turborepo.

```
apps/mobile          Expo, ті самі екрани + ZoomNativeJoin
apps/web             Vite, список → форма → деталі
packages/schemas     Zod-схеми, єдине джерело типів
packages/api         RTK Query, теги Meeting, parse відповіді
packages/ui          tailwind-variants (рядки класів)
packages/i18n        uk/en, типізовані ключі
packages/join        JoinService: LinkJoin і ZoomNativeJoin
packages/config      tsconfig.base, ESLint flat config
mocks                MSW-хендлери за REST-контрактом
```

Компоненти (`div` / `View`) живуть в застосунках. Між ними шеряться схеми, API, ключі i18n і variant-ключі.

## Контракт

| Метод | Шлях                                 | Відповідь                                            |
| ----- | ------------------------------------ | ---------------------------------------------------- |
| GET   | `/api/meetings?status&page&per_page` | `{ data, meta }`                                     |
| GET   | `/api/meetings/:id`                  | `Meeting`                                            |
| POST  | `/api/meetings`                      | `201 Meeting`                                        |
| POST  | `/api/meetings/:id/rsvp`             | `Meeting`                                            |
| GET   | `/api/meetings/:id/join`             | `{ join_url, zoom?: { meeting_number, signature } }` |

`422` має форму Laravel: `{ message, errors }`. Кожна відповідь проходить `schema.parse` у `transformResponse`. Помилка парсингу це помилка контракту.

Серверний стан лише в RTK Query. Тег `Meeting`: `LIST` і `id`. `createMeeting` і `rsvp` інвалідовують теги, кеш руками не патчиться. Клієнтський Redux-стан це один slice `meetingsFilters { status, page }`.

Підпис Zoom видає лише `/join`. Скрипт `generate-zoom-jwt.js` з клієнта прибрано.

## Запуск

```bash
pnpm install
pnpm dev:web       # http://localhost:5173, MSW у dev
pnpm dev:mobile    # Expo dev client; Zoom SDK не працює в Expo Go
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Без Laravel бекенд замінює `MeetingsMockServer`: ті самі методи викликають MSW у вебі й тестах і `fetch`-перехоплення в React Native.

## Вхід у зустріч

Екрани залежать від `JoinService`, а не від SDK.

- `LinkJoin` (web) відкриває `join_url`.
- `ZoomNativeJoin` (mobile) бере `signature` і `meeting_number` з `/join` і передає їх у `ZoomSession`. Нативний SDK підключається лише в адаптері `ZoomJoinHost`.

## tailwind-variants

Файл для відгуку: `packages/ui/src/meeting-card.variants.ts`.

`tv` з пакета tailwind-variants збирає рядок класів з `base`, `variants`, `defaultVariants` і вміє `slots`. `cva` (class-variance-authority) робить те саме для одного рядка й не має слотів: щоб по-різному пофарбувати шапку і текст картки, довелося б кликати `cva` кілька разів. `slots` повертає функцію на кожну зону (`base`, `header`, `title`, `meta`), тож одна конфігурація описує всю картку.

`compoundVariants` додає класи лише коли збігається комбінація, тут `status: live` і `interactive: true`. Жива картка в списку отримує кільце, а та сама жива картка на екрані деталей (не клікабельна) залишається без нього.

`defaultVariants` підставляє `scheduled` і `interactive: false`, якщо пропси не передали. `extend` є на `quietButtonVariants`: він наслідує `buttonVariants` і замінює base та дефолти, не копіюючи варіанти `intent` і `size`.

`createTV({ twMerge: true })` у `packages/ui/src/tv.ts` вмикає tailwind-merge (у v1 це конфіг фабрики, не поле всередині `tv({...})`). Якщо до `size: sm` (`px-3`) дописати `px-8`, у рядку лишається один padding, а не обидва. Пропси типізуються через `VariantProps<typeof meetingCardVariants>`, а кольори статусу звужені `satisfies Record<MeetingStatus, ...>`, тож новий статус у Zod не збереться, поки для нього немає класу.

Варіанти шеряться, бо це дані: рядки класів і ключі `status` / `intent` / `size` / `interactive`. Веб підставляє рядки в `className`. На React Native NativeWind не підключено: для Expo SDK 57 і RN 0.86 це окремий ризик, а веб уже на Tailwind v4 через HeroUI. Мобільні стилі в `variant-styles.ts` читають ті самі ключі й маплять їх на `StyleSheet`, включно з окремим виглядом живої інтерактивної картки.

## i18n

Мова за замовчуванням `uk`, друга `en`. Ключі типізовані через `CustomTypeOptions`. Дати форматує `Intl` (`uk-UA` / `en-GB`). У компонентах немає рядків інтерфейсу поза `t(...)`.
