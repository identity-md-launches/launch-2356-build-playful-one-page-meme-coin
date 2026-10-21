/** Owner-settable launch details. Keep unset until the real launch is ready. */
export const launch: {
  contractAddress: string | null;
  buyUrl: string | null;
  xUrl: string | null;
  telegramUrl: string | null;
} = {
  contractAddress: null,
  buyUrl: null,
  xUrl: null,
  telegramUrl: null,
};
