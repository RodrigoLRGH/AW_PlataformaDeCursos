export type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

export type JwtPayloadWithRefreshToken = JwtPayload & {
  refreshToken: string;
};