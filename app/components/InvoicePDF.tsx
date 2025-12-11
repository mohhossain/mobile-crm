import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font if needed, otherwise Helvetica is default
// Font.register({ family: 'Roboto', src: 'https://...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1F2937', // Gray-800
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // Gray-900
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280', // Gray-500
  },
  // Section Grid
  sectionGrid: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  colLeft: {
    width: '50%',
  },
  colRight: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF', // Gray-400
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  textLg: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  textBase: {
    marginBottom: 2,
    color: '#4B5563',
  },
  
  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    padding: 8,
    minHeight: 30, // Ensure row has height
  },
  // Columns
  colDesc: { 
    width: '50%', 
    paddingRight: 8 
  },
  colQty: { 
    width: '15%', 
    textAlign: 'center' 
  },
  colPrice: { 
    width: '15%', 
    textAlign: 'right' 
  },
  colTotal: { 
    width: '20%', 
    textAlign: 'right' 
  },
  
  // Totals
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB', // Blue-600 (Pulse brand color)
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  }
});

interface InvoiceProps {
  deal: any;
  user: any;
}

const InvoicePDF = ({ deal, user }: InvoiceProps) => {
  const contact = deal.contacts?.[0] || {};
  const invoiceDate = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  // FIX 1: Ensure we have data even if lineItems is missing
  // FIX 2: Ensure the description field is actually mapped
  const items = deal.lineItems && deal.lineItems.length > 0 
    ? deal.lineItems 
    : [{ 
        name: deal.title || 'Service', 
        description: deal.description || '', // Ensure this exists
        quantity: 1, 
        price: deal.amount || 0 
      }];

  const formatCurrency = (amount: number) => {
    return `$${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>#{deal.id ? deal.id.slice(0, 8).toUpperCase() : 'DRAFT'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.textLg}>{user.name || 'Your Company'}</Text>
            <Text style={styles.textBase}>{user.email || 'hello@example.com'}</Text>
          </View>
        </View>

        {/* Bill To & Details Grid */}
        <View style={styles.sectionGrid}>
          <View style={styles.colLeft}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.textLg}>{contact.name || 'Valued Client'}</Text>
            {contact.company && <Text style={styles.textBase}>{contact.company}</Text>}
            <Text style={styles.textBase}>{contact.email}</Text>
          </View>
          <View style={styles.colRight}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.textBase}>Date Issued:</Text>
              <Text style={{ fontWeight: 'bold' }}>{invoiceDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.textBase}>Due Date:</Text>
              <Text style={{ fontWeight: 'bold' }}>{dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.colDesc, fontWeight: 'bold', color: '#6B7280' }}>DESCRIPTION</Text>
            <Text style={{ ...styles.colQty, fontWeight: 'bold', color: '#6B7280' }}>QTY</Text>
            <Text style={{ ...styles.colPrice, fontWeight: 'bold', color: '#6B7280' }}>PRICE</Text>
            <Text style={{ ...styles.colTotal, fontWeight: 'bold', color: '#6B7280' }}>TOTAL</Text>
          </View>

          {/* Table Rows */}
          {items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.colDesc}>
                {/* PRIMARY FIX: Displaying both Name AND Description */}
                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ color: '#6B7280', fontSize: 9, fontStyle: 'italic' }}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={{ fontSize: 10 }}>{formatCurrency(deal.amount)}</Text>
            </View>
            <View style={{ ...styles.totalRow, borderBottomWidth: 0, marginTop: 4 }}>
              <Text style={{ ...styles.totalLabel, fontSize: 12 }}>Total Due</Text>
              <Text style={styles.totalValue}>{formatCurrency(deal.amount)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business.</Text>
          <Text style={{ marginTop: 4 }}>Generated by Pulse</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoicePDF;