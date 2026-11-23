/* RabbitXmd Baileys maintained distribution. Upstream notices and license are preserved in LICENSE and NOTICE.md. */
import { money } from './payment-messages.js'

export const PaymentDetailsServiceType = Object.freeze({ UNKNOWN: 0, UPI: 1 })
export const PaymentDetailsStatus = Object.freeze({ STATUS_UNKNOWN: 0, SUCCESS: 1 })
export const VpcScopeHint = Object.freeze({
    UNKNOWN: 0,
    WA_ONLY: 1,
    WAFFLE: 2,
    WA_META_AI: 3,
    META_AI_ONLY: 4,
    FOA_ONLY: 5
})
export const RequestLocationUpdateType = Object.freeze({ UNKNOWN: 0, CANCEL: 1 })
export const MessageEditDisplayType = Object.freeze({ DEFAULT: 0, LINK_PREVIEW_ONLY: 1 })

const drop = (object) => {
    for (const key of Object.keys(object)) {
        if (object[key] === undefined || object[key] === null) {
            delete object[key]
        }
    }
    return object
}

/** Accepts the enum name (case-insensitive) or its number, so callers can use either. */
const resolveEnum = (table, value, label, fallback) => {
    if (value === undefined || value === null) {
        return fallback
    }
    if (typeof value === 'number') {
        if (!Object.values(table).includes(value)) {
            throw new TypeError(`${label}: unknown value ${value}`)
        }
        return value
    }
    const resolved = table[String(value).toUpperCase()]
    if (resolved === undefined) {
        throw new TypeError(`${label}: unknown value "${value}", expected one of ${Object.keys(table).join(', ')}`)
    }
    return resolved
}

/**
 * A payment receipt card. The amount is the human amount (50 rupees is 50),
 * the scaling to the wire format is done by money().
 */
export const buildPaymentDetails = ({ serviceType, amount, currency, payeeName, payerName, transactionTimestampMs, transactionId, status, contextInfo } = {}) => {
    const hasAmount = amount !== undefined && amount !== null
    if (hasAmount && !currency) {
        throw new TypeError('paymentDetails: currency is required when an amount is given')
    }
    return drop({
        serviceType: resolveEnum(PaymentDetailsServiceType, serviceType, 'paymentDetails.serviceType', PaymentDetailsServiceType.UPI),
        amount: hasAmount ? money(amount, currency) : undefined,
        payeeName,
        payerName,
        transactionTimestampMs: transactionTimestampMs ?? Date.now(),
        transactionId: transactionId === undefined ? undefined : String(transactionId),
        status: resolveEnum(PaymentDetailsStatus, status, 'paymentDetails.status', PaymentDetailsStatus.SUCCESS),
        contextInfo
    })
}

export const buildVpcRequest = ({ requestId, payloadSchemaVersion = 1, scopeHint } = {}) => {
    if (requestId === undefined || requestId === null || requestId === '') {
        throw new TypeError('vpcRequest needs a requestId')
    }
    return drop({
        payloadSchemaVersion,
        requestId: String(requestId),
        scopeHint: resolveEnum(VpcScopeHint, scopeHint, 'vpcRequest.scopeHint', undefined)
    })
}

/** Cancels (or updates) a location request that was sent earlier; key is the original message key. */
export const buildRequestLocationUpdate = ({ key, updateType, senderTimestampMs } = {}) => {
    if (!key) {
        throw new TypeError('requestLocationUpdate needs the key of the original request')
    }
    return drop({
        key,
        updateType: resolveEnum(RequestLocationUpdateType, updateType, 'requestLocationUpdate.updateType', RequestLocationUpdateType.CANCEL),
        senderTimestampMs: senderTimestampMs ?? Date.now()
    })
}

export const resolveEditDisplayType = (value) => resolveEnum(MessageEditDisplayType, value, 'editDisplayType', undefined)

export const readPaymentDetails = (msg) => {
    const message = msg?.message ?? msg
    const details = message?.paymentDetailsMessage
    if (!details) {
        return null
    }
    const amount = details.amount?.offset
        ? { amount: Number(details.amount.value) / Number(details.amount.offset), currencyCode: details.amount.currencyCode }
        : undefined
    return drop({
        serviceType: details.serviceType,
        amount,
        payeeName: details.payeeName,
        payerName: details.payerName,
        transactionTimestampMs: details.transactionTimestampMs === undefined ? undefined : Number(details.transactionTimestampMs),
        transactionId: details.transactionId,
        status: details.status
    })
}
