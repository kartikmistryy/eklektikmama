import { generateEmailFriendlyQRCode, createTicketQRData } from '@/lib/qrCodeGenerator';

export default async function TicketQRPage({ params, searchParams }) {
  const { transactionId } = await params;
  const resolvedSearchParams = await searchParams;
  const ticketNumber = resolvedSearchParams?.ticketNumber;
  const eventTitle = resolvedSearchParams?.eventTitle;
  const eventLocation = resolvedSearchParams?.eventLocation;
  const eventDate = resolvedSearchParams?.eventDate;
  const eventTime = resolvedSearchParams?.eventTime;
  const eventSegment = resolvedSearchParams?.eventSegment;
  const eventMessage = resolvedSearchParams?.eventMessage;
  const eventMeetingLink = resolvedSearchParams?.eventMeetingLink;

  // Generate QR code with URL that points back to this page
  const qrData = createTicketQRData(transactionId, ticketNumber, eventTitle, eventLocation, eventDate, eventTime);
  const qrCodeDataUrl = await generateEmailFriendlyQRCode(qrData);

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '200px auto', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #093166 0%, #DB4E9F 100%)', 
        color: 'white', 
        padding: '30px', 
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          🎫 Your Digital Ticket
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
          Welcome to Eklektik Mama!
        </p>
      </div>
      
      {/* QR Code Section - Only show for non-Eklektik Edit events */}
      {qrCodeDataUrl && eventSegment !== 'eklektikEdit' && (
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          margin: '20px 0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#093166', marginBottom: '20px' }}>📱 Scan at Entrance</h2>
          <img 
            src={qrCodeDataUrl} 
            alt={`QR Code for ticket ${ticketNumber || transactionId}`}
            style={{ 
              width: '200px', 
              height: '200px', 
              border: '3px solid #e0e0e0', 
              borderRadius: '12px',
              display: 'block',
              margin: '0 auto'
            }}
          />
          <p style={{ margin: '15px 0 0 0', color: '#666', fontSize: '14px' }}>
            Present this QR code at the event entrance
          </p>
        </div>
      )}
      
      {/* Event Information */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        margin: '20px 0',
        textAlign: 'left',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#093166', fontSize: '20px' }}>🎪 Event Information</h3>
        {eventTitle && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Event:</strong> {eventTitle}</p>}
        {eventDate && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Date:</strong> {eventDate}</p>}
        {eventTime && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Time:</strong> {eventTime}</p>}
        {eventLocation && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>📍 Location:</strong> {eventLocation}</p>}
      </div>

      {/* Eklektik Edit Details */}
      {eventSegment === 'eklektikEdit' && (eventMessage || eventMeetingLink) && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px', 
          margin: '20px 0',
          textAlign: 'left',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #DB4E9F'
        }}>
          <h3 style={{ marginTop: 0, color: '#093166', fontSize: '20px' }}>📝 Eklektik Edit Details</h3>
          {eventMessage && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Message:</strong> {eventMessage}</p>}
          {eventMeetingLink && (
            <div style={{ margin: '15px 0' }}>
              <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Meeting Link:</strong></p>
              <a 
                href={eventMeetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block',
                  background: '#28a745', 
                  color: 'white', 
                  padding: '12px 24px', 
                  textDecoration: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  margin: '10px 0'
                }}
              >
                🚀 Join Meeting
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Ticket Details */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px', 
        margin: '20px 0',
        textAlign: 'left',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#093166', fontSize: '20px' }}>🎫 Ticket Details</h3>
        {ticketNumber && <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Ticket Number:</strong> #{ticketNumber}</p>}
        <p style={{ fontSize: '16px', margin: '8px 0' }}><strong>Booking ID:</strong> {transactionId}</p>
      </div>
      
      {/* Instructions */}
      <div style={{ 
        background: '#e8f5e8', 
        padding: '20px', 
        borderRadius: '12px', 
        margin: '20px 0',
        borderLeft: '4px solid #28a745'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📱 How to Use Your Ticket</h4>
        <p style={{ margin: 0, fontSize: '14px', color: '#155724' }}>
          {eventSegment === 'eklektikEdit' ? (
            <>
              <strong>For Eklektik Edit Events:</strong><br/>
              <strong>Option 1:</strong> Use the meeting link above to join the session<br/>
              <strong>Option 2:</strong> Show your booking ID: <strong>{transactionId}</strong><br/>
              {ticketNumber && <><strong>Option 3:</strong> Show your ticket number: <strong>#{ticketNumber}</strong><br/></>}
              <strong>Option 4:</strong> Show your email address
            </>
          ) : (
            <>
              <strong>Option 1:</strong> Show the QR code above at the entrance<br/>
              <strong>Option 2:</strong> Show your booking ID: <strong>{transactionId}</strong><br/>
              {ticketNumber && <><strong>Option 3:</strong> Show your ticket number: <strong>#{ticketNumber}</strong><br/></>}
              <strong>Option 4:</strong> Show your email address at the entrance
            </>
          )}
        </p>
      </div>
      
      {/* Footer */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        margin: '20px 0',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
          Thank you for choosing Eklektik Mama!
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
          If you have any questions, contact us at <a href="mailto:info@eklektikmama.com" style={{ color: '#DB4E9F' }}>info@eklektikmama.com</a>
        </p>
      </div>
    </div>
  );
}
