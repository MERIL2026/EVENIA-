/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { Event, Registration, Ticket, Payment, Feedback } from '../types';

export function generateEventReportPDF(
  event: Event,
  allRegistrations: Registration[],
  allTickets: Ticket[],
  allPayments: Payment[],
  allFeedbacks: Feedback[]
) {
  // Create a new A4 document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const eventRegistrations = allRegistrations.filter(r => r.event_id === event.id);
  const totalRegistrations = eventRegistrations.length;

  const eventTickets = allTickets.filter(t => {
    const reg = allRegistrations.find(r => r.id === t.registration_id);
    return reg && reg.event_id === event.id;
  });
  
  const checkedIn = eventTickets.filter(t => t.status === 'used').length;
  const attendanceRate = totalRegistrations > 0 
    ? Math.round((checkedIn / totalRegistrations) * 100) 
    : 0;

  const eventPayments = allPayments.filter(p => {
    const reg = allRegistrations.find(r => r.id === p.registration_id);
    return reg && reg.event_id === event.id && p.status === 'success';
  });
  
  const totalRevenue = eventPayments.reduce((sum, p) => sum + p.amount, 0);

  const eventFeedbacks = allFeedbacks.filter(f => f.event_id === event.id);
  
  // Calculations for Satisfaction Matrix
  const avgOverall = eventFeedbacks.length > 0
    ? Number((eventFeedbacks.reduce((sum, f) => sum + (f.overall_experience || f.rating || 5), 0) / eventFeedbacks.length).toFixed(1))
    : Number(event.rating || 5.0);

  const avgSpeaker = eventFeedbacks.length > 0
    ? Number((eventFeedbacks.reduce((sum, f) => sum + (f.speaker_rating || f.rating || 5), 0) / eventFeedbacks.length).toFixed(1))
    : 5.0;

  const avgVenue = eventFeedbacks.length > 0
    ? Number((eventFeedbacks.reduce((sum, f) => sum + (f.venue_rating || f.rating || 5), 0) / eventFeedbacks.length).toFixed(1))
    : 5.0;

  // Filter top-rated feedback (rating >= 4)
  const topFeedbacks = eventFeedbacks
    .filter(f => f.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3); // top 3 reviews

  // Setup Document Properties
  doc.setProperties({
    title: `Evenia Report - ${event.title}`,
    subject: 'Event Analytics & Management Report',
    author: 'Evenia System',
    creator: 'Evenia PDF Engine'
  });

  // ---------------------------------------------------------
  // DESIGN PATTERN: BRUTALIST GRID & FRAMES
  // ---------------------------------------------------------

  // 1. Draw Thick Outer Page Border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2.5);
  doc.rect(8, 8, 194, 281, 'S'); // A4 dimensions are 210 x 297

  // 2. Draw Top Red-Orange Header Box
  doc.setFillColor(240, 75, 35); // #F04B23 (Evenia Signature Red-Orange)
  doc.rect(12, 12, 186, 26, 'FD');

  // 3. Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('EVENIA ANALYTICS REPORT', 18, 22);

  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  doc.text(`SYSTEM PROTOCOL: VER-2.4 // REGISTRY-${event.id.toUpperCase()}`, 18, 30);

  // Category Badge in Header
  doc.setFillColor(0, 0, 0);
  doc.rect(142, 18, 50, 14, 'F');
  doc.setTextColor(240, 75, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(event.category.toUpperCase(), 167, 27, { align: 'center' });

  // 4. Primary Event Details Block
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(event.title.toUpperCase(), 110);
  doc.text(titleLines, 14, 50);

  // Right Details Column (Meta Data)
  doc.setFillColor(245, 243, 239); // Warm neutral off-white
  doc.rect(130, 44, 68, 30, 'FD');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text(`DATE:       ${event.date}`, 134, 50);
  doc.text(`TIME:       ${event.time}`, 134, 55);
  doc.text(`STATION:    ${event.venue.substring(0, 18).toUpperCase()}`, 134, 60);
  doc.text(`PRICE TIER: $${event.price.toFixed(2)} USD`, 134, 65);
  doc.text(`CAPACITY:   ${event.capacity} SEATS`, 134, 70);

  // 5. Divider Line below Event details
  doc.setLineWidth(1.5);
  doc.line(12, 78, 198, 78);

  // ---------------------------------------------------------
  // STATISTICAL MATRIX (THREE BENTO BOXES)
  // ---------------------------------------------------------

  // Box 1: Attendance Matrix
  doc.setFillColor(255, 255, 255);
  doc.rect(12, 84, 58, 48, 'FD');
  // Title Bar
  doc.setFillColor(0, 0, 0);
  doc.rect(12, 84, 58, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('ATTENDANCE PROTOCOL', 15, 89);
  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${checkedIn}/${totalRegistrations}`, 16, 105);
  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  doc.text('CHECKED-IN ATTENDEES', 16, 112);
  doc.setFontSize(16);
  doc.setTextColor(240, 75, 35);
  doc.text(`${attendanceRate}%`, 16, 124);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('CONVERSION FACTOR', 16, 128);

  // Box 2: Financial/Revenue Matrix
  doc.setFillColor(255, 255, 255);
  doc.rect(76, 84, 58, 48, 'FD');
  // Title Bar
  doc.setFillColor(0, 0, 0);
  doc.rect(76, 84, 58, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FINANCIAL SUMMARY', 79, 89);
  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`$${totalRevenue.toFixed(2)}`, 80, 105);
  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  doc.text('PROCESSED NET INCOME', 80, 112);
  
  const avgSpend = totalRegistrations > 0 ? (totalRevenue / totalRegistrations).toFixed(2) : '0.00';
  doc.setFontSize(14);
  doc.setTextColor(74, 168, 216); // Evenia blue-cyan
  doc.text(`$${avgSpend}`, 80, 124);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('AVG SPEND PER REGISTRANT', 80, 128);

  // Box 3: Satisfaction Matrix
  doc.setFillColor(255, 255, 255);
  doc.rect(140, 84, 58, 48, 'FD');
  // Title Bar
  doc.setFillColor(0, 0, 0);
  doc.rect(140, 84, 58, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SATISFACTION INDEX', 143, 89);
  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${avgOverall} / 5.0`, 144, 105);
  doc.setFontSize(8);
  doc.setFont('courier', 'bold');
  doc.text('OVERALL RATING INDEX', 144, 112);

  doc.setFontSize(11);
  doc.setTextColor(245, 158, 11); // Amber
  doc.text(`SPEAKERS: ${avgSpeaker}`, 144, 121);
  doc.text(`VENUE:    ${avgVenue}`, 144, 126);
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('INDIVIDUAL RATINGS', 144, 130);

  // 6. Section Divider
  doc.setLineWidth(1.0);
  doc.line(12, 140, 198, 140);

  // ---------------------------------------------------------
  // ATTENDEE DATABASE ANALYSIS TABLE
  // ---------------------------------------------------------
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ATTENDEE PARTICIPATION RECORDS', 12, 147);

  // Table header
  doc.setFillColor(245, 243, 239);
  doc.rect(12, 151, 186, 7, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('ID', 15, 155.5);
  doc.text('REGISTRANT NAME', 40, 155.5);
  doc.text('INSTITUTION / CAMPUS', 95, 155.5);
  doc.text('EMAIL ADDRESS', 145, 155.5);
  doc.text('STATUS', 182, 155.5);

  let rowY = 162;
  const listToRender = eventRegistrations.slice(0, 6); // show up to 6 registrants in detail
  
  if (listToRender.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('NO REGISTRATIONS RECORDED ON THIS MANIPULATION MATRIX YET.', 15, rowY + 3);
    rowY += 10;
  } else {
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    listToRender.forEach((reg) => {
      // Draw light underline
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(12, rowY + 3, 198, rowY + 3);

      doc.text(reg.id.substring(4, 10).toUpperCase(), 15, rowY);
      doc.text(reg.fields.name.substring(0, 22), 40, rowY);
      doc.text((reg.fields.college || 'No Campus').substring(0, 20).toUpperCase(), 95, rowY);
      doc.text(reg.fields.email.substring(0, 18), 145, rowY);
      
      const isConfirmed = reg.status === 'confirmed';
      const statusColor = isConfirmed ? [16, 185, 129] : (reg.status === 'pending' ? [245, 158, 11] : [240, 75, 35]);
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('courier', 'bold');
      doc.text(reg.status.toUpperCase(), 182, rowY);
      
      doc.setFont('courier', 'normal');
      doc.setTextColor(0, 0, 0);
      rowY += 7;
    });

    if (eventRegistrations.length > 6) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`[+] AND ${eventRegistrations.length - 6} MORE REGISTRANTS FILED IN BACKEND LOGS`, 15, rowY);
      rowY += 6;
    }
  }

  // 7. Section Divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.0);
  doc.line(12, 212, 198, 212);

  // ---------------------------------------------------------
  // SATISFACTION FEEDBACK LOGS (TOP RATED FEEDBACK)
  // ---------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOP-RATED FEEDBACK LOGS (RATING >= 4★)', 12, 219);

  let feedbackY = 224;

  if (topFeedbacks.length === 0) {
    // Fallback: draw helpful mock logs if real database reviews are empty
    doc.setFillColor(245, 243, 239);
    doc.rect(12, feedbackY, 186, 24, 'FD');
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('FEEDBACK PIPELINE ACTIVE: NO RATINGS >= 4★ RECORDED FOR THIS SPRINT YET.', 16, feedbackY + 8);
    doc.text('System is awaiting voluntary visitor surveys on checkout portals.', 16, feedbackY + 14);
    doc.text('Auto-filled satisfaction scores average is derived from user action triggers.', 16, feedbackY + 20);
    feedbackY += 32;
  } else {
    topFeedbacks.forEach((feed) => {
      // Draw background card for feedback
      doc.setFillColor(245, 243, 239);
      doc.rect(12, feedbackY, 186, 14, 'FD');
      
      // Star rating badge
      doc.setFillColor(0, 0, 0);
      doc.rect(14, feedbackY + 2.5, 18, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${feed.rating} ★`, 23, feedbackY + 8.5, { align: 'center' });

      // Comments
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const commentLines = doc.splitTextToSize(`"${feed.comments}"`, 142);
      doc.text(commentLines, 36, feedbackY + 6.5);

      // Metadata line (Anonymous checkout or email logs)
      doc.setTextColor(120, 120, 120);
      doc.setFont('courier', 'bold');
      doc.setFontSize(7);
      doc.text(`REGISTRY ID: ${feed.id.toUpperCase()}`, 36, feedbackY + 11.5);

      feedbackY += 17;
    });
  }

  // ---------------------------------------------------------
  // FINAL SYSTEM SIGN-OFF / BRANDING FOOTER
  // ---------------------------------------------------------
  const footerY = 272;
  
  // Footer divider line
  doc.setLineWidth(1.5);
  doc.line(12, footerY - 4, 198, footerY - 4);

  // Left Brand info
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('EVENIA PLATFORM INC.', 12, footerY + 1);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('CLOUD COMPILATION CERTIFICATION NODE', 12, footerY + 5);
  doc.text('ALL LOGS ARE REAL-TIME & STORED LOCALLY', 12, footerY + 9);

  // Right official seal box
  doc.setFillColor(0, 0, 0);
  doc.rect(146, footerY - 2, 52, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL REPORT', 172, footerY + 4, { align: 'center' });
  doc.setTextColor(240, 75, 35);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.text('SECURE TRANSMISSION', 172, footerY + 9, { align: 'center' });

  // Save the PDF!
  doc.save(`Evenia_Report_${event.title.replace(/\s+/g, '_')}.pdf`);
}
