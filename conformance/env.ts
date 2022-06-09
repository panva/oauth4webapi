const { PLAN_NAME = 'oidcc-client-basic-certification-test-plan', VARIANT = '{}' } = process.env

export const JWS_ALGORITHM = process.env.JWS_ALGORITHM
  ? process.env.JWS_ALGORITHM
  : PLAN_NAME.startsWith('fapi')
  ? 'PS256'
  : 'RS256'

export { PLAN_NAME, VARIANT }
