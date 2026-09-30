interface MatchedStudentEmailData {
  studentName: string
  opportunityTitle: string
  companyName: string
  location: string
  type: string
  salary?: string
  deadline: string
  description: string
  skillsRequired: string[]
  acceptUrl: string
  rejectUrl: string
}

export function matchedStudentTemplate(data: MatchedStudentEmailData): string {
  const {
    studentName,
    opportunityTitle,
    companyName,
    location,
    type,
    salary,
    deadline,
    description,
    skillsRequired,
    acceptUrl,
    rejectUrl,
  } = data

  const skillsList = skillsRequired.slice(0, 6).map((skill) => `
    <span style="display: inline-block; padding: 6px 14px; background-color: #f0f9ff; border-radius: 20px; color: #0369a1; font-size: 12px; font-weight: 500; margin: 4px 4px 4px 0;">${skill}</span>
  `).join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Matched!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">✨ You've Been Matched!</h1>
              <p style="margin: 8px 0 0 0; color: #ede9fe; font-size: 14px;">Our AI has recommended you for an exciting opportunity</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Great news! Based on your profile and skills, you've been matched with an opportunity that could be a perfect fit for you. Please review the details below and let us know if you're interested.
              </p>
            </td>
          </tr>
          
          <!-- Opportunity Card -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%); border-radius: 12px; border: 1px solid #e9d5ff;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 600;">${opportunityTitle}</h2>
                    <p style="margin: 0 0 16px 0; color: #7c3aed; font-size: 16px; font-weight: 500;">${companyName}</p>
                    
                    <!-- Info Pills -->
                    <table role="presentation" style="border-collapse: collapse; margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 6px 14px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;">
                          <span style="color: #475569; font-size: 12px; font-weight: 500;">📍 ${location}</span>
                        </td>
                        <td style="width: 8px;"></td>
                        <td style="padding: 6px 14px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0;">
                          <span style="color: #475569; font-size: 12px; font-weight: 500; text-transform: capitalize;">💼 ${type}</span>
                        </td>
                        ${
                          salary
                            ? `
                        <td style="width: 8px;"></td>
                        <td style="padding: 6px 14px; background-color: #ecfdf5; border-radius: 20px; border: 1px solid #a7f3d0;">
                          <span style="color: #047857; font-size: 12px; font-weight: 500;">💰 ₹${salary}</span>
                        </td>
                        `
                            : ""
                        }
                      </tr>
                    </table>

                    <!-- Deadline -->
                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px;">
                      <span style="color: #dc2626;">⏰</span> Application Deadline: <strong style="color: #0f172a;">${deadline}</strong>
                    </p>
                    
                    <!-- Description -->
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                      ${description.length > 200 ? description.substring(0, 200) + '...' : description}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Skills Section -->
          <tr>
            <td style="padding: 24px 40px 16px 40px;">
              <p style="margin: 0 0 12px 0; color: #334155; font-size: 14px; font-weight: 600;">Skills Required:</p>
              <div style="line-height: 1.8;">
                ${skillsList}
                ${skillsRequired.length > 6 ? `<span style="display: inline-block; padding: 6px 14px; background-color: #f1f5f9; border-radius: 20px; color: #64748b; font-size: 12px; font-weight: 500; margin: 4px 4px 4px 0;">+${skillsRequired.length - 6} more</span>` : ''}
              </div>
            </td>
          </tr>
          
          <!-- Response Section -->
          <tr>
            <td style="padding: 16px 40px 32px 40px;">
              <p style="margin: 0 0 20px 0; color: #334155; font-size: 15px; font-weight: 600; text-align: center;">
                Are you interested in this opportunity?
              </p>
              
              <!-- Action Buttons -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <a href="${acceptUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);">
                      ✓ Yes, I'm Interested
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="height: 16px;"></td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <a href="${rejectUrl}" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.4);">
                      ✗ Not Interested
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Note -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fefce8; border-radius: 12px; border: 1px solid #fef08a;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #854d0e; font-size: 13px; line-height: 1.5;">
                      <strong>💡 Note:</strong> Clicking "Yes, I'm Interested" will notify the placement cell of your interest. This does not automatically apply you for the position. You may still need to submit a formal application.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #e2e8f0;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
                This is an automated message from the Placement Portal.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                If you have any questions, please contact the placement cell.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}
