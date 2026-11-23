import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MessageEditDisplayType, PaymentDetailsStatus, VpcScopeHint, buildPaymentDetails, buildRequestLocationUpdate, buildVpcRequest, readPaymentDetails, resolveEditDisplayType } from '../src/Utils/proto-features.js';

test('paymentDetails scales the human amount and fills sensible defaults', () => {
    const details = buildPaymentDetails({ amount: 50, currency: 'inr', payeeName: 'A', payerName: 'B', transactionId: 123, transactionTimestampMs: 1 });
    assert.deepEqual(details.amount, { value: 50000, offset: 1000, currencyCode: 'INR' });
    assert.equal(details.transactionId, '123');
    assert.equal(details.status, PaymentDetailsStatus.SUCCESS);
    assert.equal(details.serviceType, 1);
    assert.throws(() => buildPaymentDetails({ amount: 5 }), /currency is required/);
    assert.throws(() => buildPaymentDetails({ amount: -1, currency: 'INR' }), /non-negative/);
});

test('paymentDetails round-trips through readPaymentDetails', () => {
    const details = buildPaymentDetails({ amount: 12.5, currency: 'USD', transactionTimestampMs: 7 });
    const read = readPaymentDetails({ message: { paymentDetailsMessage: details } });
    assert.deepEqual(read.amount, { amount: 12.5, currencyCode: 'USD' });
    assert.equal(read.transactionTimestampMs, 7);
    assert.equal(readPaymentDetails({ message: {} }), null);
});

test('vpcRequest accepts enum names or numbers and rejects bad input', () => {
    assert.equal(buildVpcRequest({ requestId: 'r1', scopeHint: 'waffle' }).scopeHint, VpcScopeHint.WAFFLE);
    assert.equal(buildVpcRequest({ requestId: 1, scopeHint: 4 }).scopeHint, 4);
    assert.equal(buildVpcRequest({ requestId: 'r1' }).payloadSchemaVersion, 1);
    assert.equal('scopeHint' in buildVpcRequest({ requestId: 'r1' }), false);
    assert.throws(() => buildVpcRequest({}), /requestId/);
    assert.throws(() => buildVpcRequest({ requestId: 'r', scopeHint: 'nope' }), /unknown value/);
    assert.throws(() => buildVpcRequest({ requestId: 'r', scopeHint: 99 }), /unknown value/);
});

test('requestLocationUpdate needs the original key and defaults to cancel', () => {
    const update = buildRequestLocationUpdate({ key: { id: 'X' }, senderTimestampMs: 5 });
    assert.deepEqual(update, { key: { id: 'X' }, updateType: 1, senderTimestampMs: 5 });
    assert.throws(() => buildRequestLocationUpdate({}), /original request/);
});

test('editDisplayType resolves names, numbers and absence', () => {
    assert.equal(resolveEditDisplayType('link_preview_only'), MessageEditDisplayType.LINK_PREVIEW_ONLY);
    assert.equal(resolveEditDisplayType(0), 0);
    assert.equal(resolveEditDisplayType(), undefined);
    assert.throws(() => resolveEditDisplayType('x'), /unknown value/);
});
