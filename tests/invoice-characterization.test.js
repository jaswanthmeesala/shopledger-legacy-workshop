'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../lib/pricing');
var invoice = require('../lib/invoice');
var reports = require('../lib/reports');

function makeOrder(coupon) {
  var items = [{
    id: 1,
    name: 'Rice',
    sku: 'GRN-001',
    hsn: '1006',
    price: 500,
    qty: 1
  }];
  var totals = pricing.computeTotals(items, coupon || '');

  return {
    id: 1,
    date: '22/11/2026',
    customer: 'In-memory customer',
    paymentMode: 'cash',
    status: 'completed',
    items: items,
    coupon: coupon || '',
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total
  };
}

test('invoice uses the billed HSN slab when calculating GST', function () {
  var order = makeOrder('');
  var billed = pricing.computeTotals(order.items, order.coupon);
  var printed = invoice.computeInvoiceFigures(order);

  assert.equal(billed.tax, 25);
  assert.equal(billed.total, 525);
  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.tax, 25);
  assert.equal(printed.cgst, 12.5);
  assert.equal(printed.sgst, 12.5);
  assert.equal(printed.total, 525);
});

test('invoice percentage coupon matches the billed discount and post-discount GST', function () {
  var order = makeOrder('SAVE10');
  var billed = pricing.computeTotals(order.items, order.coupon);
  var printed = invoice.computeInvoiceFigures(order);

  assert.equal(billed.discount, 50);
  assert.equal(billed.tax, 22.5);
  assert.equal(billed.total, 472.5);
  assert.equal(printed.discount, 50);
  assert.equal(printed.tax, 22.5);
  assert.equal(printed.cgst, 11.25);
  assert.equal(printed.sgst, 11.25);
  assert.equal(printed.rows[0].lineTax, 22.5);
  assert.equal(printed.total, 472.5);
});

test('GST reconciliation matches the invoice calculation against the in-memory order ledger', function () {
  var order = makeOrder('SAVE10');
  var result = reports.getGstReconciliation({ orders: [order] });

  assert.equal(result.totalChecked, 1);
  assert.equal(result.mismatchCount, 0);
  assert.equal(result.totalDelta, 0);
  assert.equal(result.rows[0].ledgerTax, 22.5);
  assert.equal(result.rows[0].invoiceTax, 22.5);
  assert.equal(result.rows[0].ledgerTotal, 472.5);
  assert.equal(result.rows[0].invoiceTotal, 472.5);
  assert.equal(result.rows[0].delta, 0);
  assert.equal(result.rows[0].matched, true);
});

test('invoice totals and item GST match the amount billed by order pricing', function () {
  var order = makeOrder('SAVE10');
  var billed = pricing.computeTotals(order.items, order.coupon);
  var printed = invoice.computeInvoiceFigures(order);

  assert.equal(printed.subtotal, billed.subtotal);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
  assert.equal(printed.total, billed.total);
  assert.equal(printed.rows[0].gstPercent, billed.lines[0].gstPercent);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
});

