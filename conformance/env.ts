export const { PLAN_NAME = 'oidcc-client-basic-certification-test-plan', VARIANT = '{}' } =
  process.env
export const JWS_ALGORITHM = process.env.JWS_ALGORITHM ? process.env.JWS_ALGORITHM : 'EdDSA'
