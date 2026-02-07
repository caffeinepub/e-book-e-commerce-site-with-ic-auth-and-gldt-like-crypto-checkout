import { Principal } from '@icp-sdk/core/principal';

export function parsePrincipal(principalString: string): Principal {
  try {
    return Principal.fromText(principalString);
  } catch (error) {
    throw new Error('Invalid principal format');
  }
}
