"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: '#3B82F6', // Primary color placeholder
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flexDirection: 'column',
    width: '45%',
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    color: '#111827',
    marginBottom: 2,
  },
  table: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
  },
  totalLabel: { fontSize: 12, fontWeight: 'bold' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: '#3B82F6' },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface InvoiceProps {
  deal: any;
  user: any;
}

export default function InvoicePDF({ deal, user }: InvoiceProps) {
  const contact = deal.contacts[0] || {};
  const invoiceDate = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(); // Net 30 auto
  
  // Fallback if no line items exist (legacy deals)
  const items = deal.lineItems?.length > 0 ? deal.lineItems : [
    { name: deal.title, quantity: 1, price: deal.amount }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
           <View>
             <Text style={styles.title}>Invoice</Text>
             <Text style={{fontSize: 10, color: '#6B7280', marginTop: 4}}>#{deal.id.slice(0, 8).toUpperCase()}</Text>
           </View>
           <View>
             {/* Placeholder for user logo logic */}
             <Text style={{fontSize: 14, fontWeight: 'bold'}}>{user.name}</Text>
             <Text style={{fontSize: 10, color: '#6B7280'}}>{user.email}</Text>
           </View>
        </View>

        {/* Info Grid */}
        <View style={styles.row}>
          <View style={styles.column}>
             <Text style={styles.label}>Bill To</Text>
             <Text style={{...styles.value, fontWeight: 'bold'}}>{contact.name || "Valued Client"}</Text>
             <Text style={styles.value}>{contact.email}</Text>
             <Text style={styles.value}>{contact.company || ""}</Text>
          </View>
          <View style={styles.column}>
             <Text style={styles.label}>Details</Text>
             <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
               <Text style={{fontSize: 10}}>Date Issued:</Text>
               <Text style={styles.value}>{invoiceDate}</Text>
             </View>
             <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
               <Text style={{fontSize: 10}}>Due Date:</Text>
               <Text style={styles.value}>{dueDate}</Text>
             </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
           <View style={styles.tableHeader}>
              <Text style={{...styles.colDesc, fontSize: 10, fontWeight: 'bold'}}>Description</Text>
              <Text style={{...styles.colQty, fontSize: 10, fontWeight: 'bold'}}>Qty</Text>
              <Text style={{...styles.colRate, fontSize: 10, fontWeight: 'bold'}}>Price</Text>
              <Text style={{...styles.colTotal, fontSize: 10, fontWeight: 'bold'}}>Total</Text>
           </View>
           {items.map((item: any, i: number) => (
             <View key={i} style={styles.tableRow}>
                <Text style={{...styles.colDesc, fontSize: 10}}>{item.name}</Text>
                <Text style={{...styles.colQty, fontSize: 10}}>{item.quantity}</Text>
                <Text style={{...styles.colRate, fontSize: 10}}>${item.price.toLocaleString()}</Text>
                <Text style={{...styles.colTotal, fontSize: 10}}>${(item.price * item.quantity).toLocaleString()}</Text>
             </View>
           ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
           <View>
             <View style={styles.totalRow}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>${deal.amount.toLocaleString()}</Text>
             </View>
             <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalValue}>${deal.amount.toLocaleString()}</Text>
             </View>
           </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
           <Text>Thank you for your business.</Text>
           <Text style={{marginTop: 4}}>Generated by Pulse</Text>
        </View>

      </Page>
    </Document>
  );
}