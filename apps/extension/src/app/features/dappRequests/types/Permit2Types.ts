import { REACTOR_ADDRESS_MAPPING } from '@uniswap/uniswapx-sdk'
import { TypeDefinitionSchema } from 'src/app/features/dappRequests/types/EIP712Types'
import { z } from 'zod'

const MessageSchema = z.object({
  details: z.object({
    token: z.string(),
    amount: z.string(),
    expiration: z.string(),
    nonce: z.string(),
  }),
  spender: z.string(),
  sigDeadline: z.string(),
})
export type Permit2Message = z.infer<typeof MessageSchema>

const TypesSchema = z
  .object({
    EIP712Domain: z.array(TypeDefinitionSchema),
    PermitDetails: z.array(TypeDefinitionSchema),
    PermitSingle: z.array(TypeDefinitionSchema),
  })
  .catchall(z.array(TypeDefinitionSchema))

const DomainSchema = z.object({
  name: z.literal('Permit2'),
  chainId: z.union([z.number(), z.bigint(), z.string()]),
  verifyingContract: z.string(),
})

const Permit2Schema = z.object({
  domain: DomainSchema,
  types: TypesSchema,
  primaryType: z.literal('PermitSingle'),
  message: MessageSchema,
})

type Permit2 = z.infer<typeof Permit2Schema>

export function isPermit2(data: unknown): data is Permit2 {
  return Permit2Schema.safeParse(data).success
}

export const UniswapXSchema = Permit2Schema.refine(
  (data) => {
    try {   
      const { message, domain } = data
      const spender = message.spender?.toLowerCase()
      const uniswapXAddress = REACTOR_ADDRESS_MAPPING?.[Number(domain.chainId)]?.Dutch_V2?.toLowerCase()
      return uniswapXAddress && spender === uniswapXAddress
    } catch {
      return false
    }
  },
  {
    message: 'Invalid UniswapX request',
  }
)
type UniswapX = z.infer<typeof UniswapXSchema>

export function isUniswapXSwapRequest(data: unknown): data is UniswapX {
  return UniswapXSchema.safeParse(data).success
}
