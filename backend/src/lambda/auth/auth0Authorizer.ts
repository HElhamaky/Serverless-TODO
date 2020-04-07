import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
// import { decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

import * as middy from 'middy';
// import { secretsManager } from 'middy/middlewares';

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJXDDAnnkMhuvWMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNVBAMTFmRldi1wejh0cXRoaC5hdXRoMC5jb20wHhcNMjAwNDA3MDkyOTM1WhcNMzMxMjE1MDkyOTM1WjAhMR8wHQYDVQQDExZkZXYtcHo4dHF0aGguYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqOBMHA3LEwGLbBmaaMDSHRwHNVHQY6hPUXFs8LVGIcLoxN01EUrSDmRP1UHN+iFWKEOAnALok8W2bUjR+qkRUNYuH169V1fhBpAtp6eD6Ngs7kc8S2XIJtQJbrW453CrNUZse3+KpZgNPdKd/2vSroRvEAgK12BUAZnqB5lY7xe+1CsxCpZYQA75ChbWj7kUUtGvvhf1SNmYr5rcgMvFUVVkNlSOBsjgY5qyQC8QaRSjuhNHpdAvOINRwEB0WBo654+hV1uvTqCHe5puEEBb6AEj4nfRCPdtZ31Xs4E0zL6wjorIzf3YlPgG0gYSPMjwtNmlCCkTjiS36FkNDH7X5QIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTBkT2FfrAn5VbtiGQersA2X2kVUzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAD+pHmrjOKNeB7y6s8ExkcvxBXmvqpmiLz1N2+IZ6vFfw1Vey7vr0yiVRWoCFKsq5psTuxyqu9/MrJPV7IHfh35jqtehP95GDRXW0fKsHDD1RoAUjLpXOlKKFeom+jnPsjEe0kVQBXiU2rZDbAU1HfudiUKSoJl9/0oTdA+egpioEq1DdrrMMTHlxN9SM6UmQz1lVVa5fj9qFMtgoGRXM4KUj4rN3XQrVnUIcHW0gxJFyW0bVyPe/acP3PM7A5JALMEz3jQEYO7t0hXCBsqmmpl891dLUT4taE/dqTlw6rvS7GApbozjeAeYuFZbdjaSv6O8sdlPkVPVQXEqSVQWGz8=
-----END CERTIFICATE-----
`

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

export const handler = middy(async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

// const authSecret = process.env.AUTH_0_SECRET

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token,cert, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
