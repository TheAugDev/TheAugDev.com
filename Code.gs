// Code.gs for TAD_ContactForm_Backend (Portfolio Website Contact Form)

// --- CONFIGURATION ---
const MY_EMAIL = "AugmentedDev@outlook.com"; // Your email to receive contact messages
const SENDER_NAME_FOR_PROSPECT = "The Augmented Developer"; // Sender name for confirmation email to prospect
// Recommended: Store SPREADSHEET_ID and SHEET_NAME in Script Properties (Project Settings > Script Properties)
//   CONTACT_SPREADSHEET_ID = "your_new_spreadsheet_id_for_contacts"
//   CONTACT_SHEET_NAME = "Sheet1" (or your specific tab name like "ContactLogs")


function doPost(e) {
  let responseMessage = "Message sent successfully! Thank you for reaching out.";
  let status = "success";

  try {
    Logger.log("TAD Contact Form doPost called.");

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request: No data received.");
    }

    const formData = JSON.parse(e.postData.contents);
    Logger.log("Parsed contact form data: " + JSON.stringify(formData));

    const { name, email: prospectEmail, subject, message } = formData;

    if (!name || !prospectEmail || !subject || !message) {
      throw new Error("Missing required fields: Name, Email, Subject, and Message are required.");
    }

    // 1. Store data in the new Google Sheet
    const storeResult = storeContactFormDataInSheet(formData);
    if (!storeResult.success) {
      Logger.log("Warning: Failed to store contact form data in sheet. " + storeResult.message);
    } else {
      Logger.log("Contact form data stored in sheet.");
    }

    // 2. Send email to you (the freelancer)
    const emailToFreelancerSubject = `Website Contact: ${subject} - From ${name}`;
    let emailToFreelancerBody = `You have a new message from TheAugDev.com contact form:\n\n`;
    emailToFreelancerBody += `Timestamp: ${new Date().toLocaleString('en-US', { timeZone: "America/New_York" })}\n`; // Or your preferred timezone
    emailToFreelancerBody += `Name: ${name}\n`;
    emailToFreelancerBody += `Email: ${prospectEmail}\n`;
    emailToFreelancerBody += `Subject: ${subject}\n\n`;
    emailToFreelancerBody += `Message:\n${message}\n\n`;
    emailToFreelancerBody += `------------------------------------\nLogged to Google Sheet: ${storeResult.success ? 'Yes' : 'No - Check Logs'}`;

    MailApp.sendEmail({
      to: MY_EMAIL,
      subject: emailToFreelancerSubject,
      body: emailToFreelancerBody,
      replyTo: prospectEmail
    });
    Logger.log("Contact message forwarded to " + MY_EMAIL);

    // 3. Send a stunning confirmation email to the prospect
    sendStunningConfirmationToProspect(prospectEmail, name, subject);
    Logger.log("Confirmation email dispatched to " + prospectEmail);

  } catch (error) {
    Logger.log("Error in TAD Contact Form doPost: " + error.toString() + " Stack: " + error.stack);
    status = "error";
    responseMessage = "Sorry, an issue occurred while sending your message. Please try again or email " + MY_EMAIL + " directly. Error details: " + error.message;
  }

  return ContentService.createTextOutput(JSON.stringify({ status: status, message: responseMessage }))
                     .setMimeType(ContentService.MimeType.JSON);
}

// Add a doGet function to handle GET requests gracefully
function doGet(e) {
  return ContentService.createTextOutput(
    'This endpoint is for TheAugDev.com contact form submissions. Please use POST requests to submit the form.'
  ).setMimeType(ContentService.MimeType.TEXT);
}

function storeContactFormDataInSheet(formData) {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const spreadsheetId = scriptProperties.getProperty('CONTACT_SPREADSHEET_ID');
    const sheetName = scriptProperties.getProperty('CONTACT_SHEET_NAME') || "Sheet1"; 

    if (!spreadsheetId) {
      Logger.log("CONTACT_SPREADSHEET_ID not found in Script Properties. Data not logged to sheet.");
      return { success: false, message: "Spreadsheet ID not configured for logging." };
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
       Logger.log(`Sheet named "${sheetName}" not found in Spreadsheet ID: ${spreadsheetId}. Attempting to create it.`);
       const newSheet = ss.insertSheet(sheetName);
       newSheet.appendRow(["Timestamp", "Name", "Email", "Subject", "Message"]); // Add header to new sheet
       Logger.log(`Sheet "${sheetName}" created successfully.`);
       // Re-get the sheet object
       const createdSheet = ss.getSheetByName(sheetName);
       if (!createdSheet) throw new Error(`Failed to create or find sheet: ${sheetName}`);
       createdSheet.appendRow([new Date(), formData.name || "", formData.email || "", formData.subject || "", formData.message || ""]);

    } else {
        // Ensure header row exists if sheet is empty, or match existing headers
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["Timestamp", "Name", "Email", "Subject", "Message"]);
        }
        sheet.appendRow([
          new Date(), 
          formData.name || "",
          formData.email || "",
          formData.subject || "",
          formData.message || ""
        ]);
    }
    
    Logger.log("Contact form data appended to sheet: " + ss.getName() + " -> " + (sheet ? sheet.getName() : sheetName));
    return { success: true, message: "Data logged to sheet." };

  } catch (error) {
    Logger.log("Error in storeContactFormDataInSheet: " + error.toString() + " Stack: " + error.stack);
    return { success: false, message: "Failed to log data to sheet: " + error.toString() };
  }
}

function sendStunningConfirmationToProspect(prospectEmail, prospectName, originalSubject) {
  const subject = `We've Received Your Message: "${originalSubject}"`;
  const greetingName = prospectName || "there";
  const yourWebsiteProcessPageUrl = "https://TheAugDev.com/process.html"; // Ensure this is correct
  const yourWebsiteUrl = "https://TheAugDev.com"; // Ensure this is correct

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0d1117; color: #EAEFFB; -webkit-font-smoothing: antialiased; }
      .email-wrapper { max-width: 600px; margin: 20px auto; background-color: #161b22; border-radius: 10px; overflow: hidden; border: 1px solid #0A7CFF; }
      .header { background: linear-gradient(135deg, #0A7CFF 0%, #2CEEF0 100%); color: #ffffff; padding: 35px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-family: 'Montserrat', sans-serif; font-weight: 700; }
      .content { padding: 30px 35px; font-size: 16px; line-height: 1.7; }
      .content p { margin: 0 0 18px 0; }
      .highlight { color: #2CEEF0; font-weight: bold; }
      .call-to-action { margin-top: 25px; text-align: center; }
      .button { display: inline-block; background-color: #0A7CFF; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-family: 'Montserrat', sans-serif; transition: background-color 0.3s ease; }
      .button:hover { background-color: #2CEEF0; color: #121828; }
      .footer { text-align: center; padding: 25px; font-size: 13px; color: #A0AEC0; border-top: 1px solid #30363d;}
      .footer a { color: #2CEEF0; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <h1>Message Received!</h1>
      </div>
      <div class="content">
        <p>Hello ${greetingName},</p>
        <p>Thank you for reaching out to <span class="highlight">The Augmented Developer</span>! We've successfully received your message regarding: "<strong>${originalSubject}</strong>".</p>
        <p>We appreciate you taking the time to connect. I will personally review your inquiry and get back to you as soon as possible, typically within 1-2 business days.</p>
        <p>In the meantime, feel free to explore more about how I leverage AI to build exceptional web experiences:</p>
        <div class="call-to-action">
          <a href="${yourWebsiteProcessPageUrl}" class="button">Discover My AI Process</a>
        </div>
        <p style="margin-top: 25px;">Looking forward to connecting further!</p>
        <p>Best regards,</p>
        <p><strong>The Augmented Developer Team</strong><br><a href="${yourWebsiteUrl}" style="color:#A0AEC0; font-size:0.9em;">TheAugDev.com</a></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} The Augmented Developer. All rights reserved.
      </div>
    </div>
  </body>
  </html>`;

  MailApp.sendEmail({
    to: prospectEmail,
    subject: subject,
    htmlBody: htmlBody,
    name: SENDER_NAME_FOR_PROSPECT,
    replyTo: MY_EMAIL
  });
}