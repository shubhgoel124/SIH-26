interface OpportunityEmailData {
  studentName: string
  opportunityTitle: string
  companyName: string
  location: string
  type: string
  salary?: string
  deadline: string
  description: string
  skillsRequired: string[]
  eligibleDepartments: string[]
  opportunityUrl: string
}

export function newOpportunityTemplate(data: OpportunityEmailData): string {
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
    eligibleDepartments,
    opportunityUrl,
  } = data

  const skillsList = skillsRequired.map((skill) => `<li style="margin: 4px 0;">${skill}</li>`).join("")
  const departmentsList = eligibleDepartments.join(", ")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Opportunity Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🎯 New Opportunity Alert!</h1>
              <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px;">A new opportunity matching your profile is available</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Great news! A new opportunity has been posted that might interest you. Check out the details below:
              </p>
            </td>
          </tr>
          
          <!-- Opportunity Card -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 600;">${opportunityTitle}</h2>
                    <p style="margin: 0 0 16px 0; color: #3b82f6; font-size: 16px; font-weight: 500;">${companyName}</p>
                    
                    <!-- Info Pills -->
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 12px; background-color: #f0f9ff; border-radius: 20px; margin-right: 8px;">
                          <span style="color: #0369a1; font-size: 12px; font-weight: 500;">📍 ${location}</span>
                        </td>
                        <td style="width: 8px;"></td>
                        <td style="padding: 4px 12px; background-color: #f0f9ff; border-radius: 20px;">
                          <span style="color: #0369a1; font-size: 12px; font-weight: 500; text-transform: capitalize;">💼 ${type}</span>
                        </td>
                        ${
                          salary
                            ? `
                        <td style="width: 8px;"></td>
                        <td style="padding: 4px 12px; background-color: #ecfdf5; border-radius: 20px;">
                          <span style="color: #047857; font-size: 12px; font-weight: 500;">💰 ₹${salary}</span>
                        </td>
                        `
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Description -->
          <tr>
            <td style="padding: 24px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">About the Role</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                ${description.length > 300 ? description.substring(0, 300) + "..." : description}
              </p>
            </td>
          </tr>
          
          <!-- Skills Required -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Skills Required</h3>
              <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px;">
                ${skillsList}
              </ul>
            </td>
          </tr>
          
          <!-- Eligible Departments -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h3 style="margin: 0 0 8px 0; color: #334155; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Eligible Departments</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px;">${departmentsList}</p>
            </td>
          </tr>
          
          <!-- Deadline Warning -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>⏰ Application Deadline:</strong> ${deadline}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px 40px;" align="center">
              <a href="${opportunityUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                View Opportunity Details
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                This email was sent by the Placement Cell. If you have any questions, please contact us.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

interface InterviewScheduledEmailData {
  studentName: string
  opportunityTitle: string
  companyName: string
  interviewDate: string
  interviewTime: string
  interviewLink: string
  interviewerDetails?: string
  applicationUrl: string
}

export function interviewScheduledTemplate(data: InterviewScheduledEmailData): string {
  const {
    studentName,
    opportunityTitle,
    companyName,
    interviewDate,
    interviewTime,
    interviewLink,
    interviewerDetails,
    applicationUrl,
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Scheduled</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🎉 Congratulations! Interview Scheduled</h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">Your application has been shortlisted</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Great news! Your application for <strong>${opportunityTitle}</strong> at <strong>${companyName}</strong> has been shortlisted, and an interview has been scheduled.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f3ff; border-radius: 12px; border: 1px solid #ddd6fe;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #5b21b6; font-size: 18px; font-weight: 600;">📅 Interview Details</h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                          <span style="color: #7c3aed; font-size: 12px; font-weight: 600; text-transform: uppercase;">Date</span>
                          <p style="margin: 4px 0 0 0; color: #1e1b4b; font-size: 16px; font-weight: 500;">${interviewDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                          <span style="color: #7c3aed; font-size: 12px; font-weight: 600; text-transform: uppercase;">Time</span>
                          <p style="margin: 4px 0 0 0; color: #1e1b4b; font-size: 16px; font-weight: 500;">${interviewTime}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e9d5ff;">
                          <span style="color: #7c3aed; font-size: 12px; font-weight: 600; text-transform: uppercase;">Company</span>
                          <p style="margin: 4px 0 0 0; color: #1e1b4b; font-size: 16px; font-weight: 500;">${companyName}</p>
                        </td>
                      </tr>
                      ${
                        interviewerDetails
                          ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #7c3aed; font-size: 12px; font-weight: 600; text-transform: uppercase;">Interviewer</span>
                          <p style="margin: 4px 0 0 0; color: #1e1b4b; font-size: 14px;">${interviewerDetails}</p>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px;" align="center">
              <a href="${interviewLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.4);">
                🎥 Join Interview
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>💡 Tips:</strong> Be on time, test your camera/mic beforehand, and keep your resume handy.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 32px 40px;" align="center">
              <a href="${applicationUrl}" style="color: #6366f1; font-size: 14px; text-decoration: underline;">
                View Application Details
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                This email was sent by the Placement Cell. Good luck with your interview!
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

interface InterviewAcceptedEmailData {
  studentName: string
  opportunityTitle: string
  companyName: string
  startDate: string
  salary?: string
  additionalInfo?: string
  applicationUrl: string
}

export function interviewAcceptedTemplate(data: InterviewAcceptedEmailData): string {
  const {
    studentName,
    opportunityTitle,
    companyName,
    startDate,
    salary,
    additionalInfo,
    applicationUrl,
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Hired!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🎊 Congratulations! You're Hired!</h1>
              <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">Your hard work has paid off</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                We are thrilled to inform you that you have been <strong style="color: #059669;">selected</strong> for the position of <strong>${opportunityTitle}</strong> at <strong>${companyName}</strong>! 🎉
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #047857; font-size: 18px; font-weight: 600;">🏢 Offer Details</h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                          <span style="color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase;">Position</span>
                          <p style="margin: 4px 0 0 0; color: #064e3b; font-size: 16px; font-weight: 500;">${opportunityTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                          <span style="color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase;">Company</span>
                          <p style="margin: 4px 0 0 0; color: #064e3b; font-size: 16px; font-weight: 500;">${companyName}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #a7f3d0;">
                          <span style="color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase;">Start Date</span>
                          <p style="margin: 4px 0 0 0; color: #064e3b; font-size: 16px; font-weight: 500;">${startDate}</p>
                        </td>
                      </tr>
                      ${
                        salary
                          ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase;">Package</span>
                          <p style="margin: 4px 0 0 0; color: #064e3b; font-size: 16px; font-weight: 500;">₹${salary}</p>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${
            additionalInfo
              ? `
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <h3 style="margin: 0 0 8px 0; color: #334155; font-size: 14px; font-weight: 600; text-transform: uppercase;">Additional Information</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">${additionalInfo}</p>
            </td>
          </tr>
          `
              : ""
          }
          
          <tr>
            <td style="padding: 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">
                      <strong>📋 Next Steps:</strong> Please check your application for further onboarding instructions and required documents.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 32px 40px;" align="center">
              <a href="${applicationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);">
                View Application Details
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                Congratulations once again! We wish you all the best in your new role.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

interface ApplicationRejectedEmailData {
  studentName: string
  opportunityTitle: string
  companyName: string
  feedback?: string
  jobsUrl: string
}

export function applicationRejectedTemplate(data: ApplicationRejectedEmailData): string {
  const {
    studentName,
    opportunityTitle,
    companyName,
    feedback,
    jobsUrl,
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #64748b 0%, #475569 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Application Update</h1>
              <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px;">Regarding your application</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Thank you for your interest in the <strong>${opportunityTitle}</strong> position at <strong>${companyName}</strong> and for taking the time to apply.
              </p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current requirements.
              </p>
            </td>
          </tr>
          
          ${
            feedback
              ? `
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; font-weight: 600;">💬 Feedback</h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">${feedback}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }
          
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">
                      <strong>💪 Don't give up!</strong> This is just one opportunity. There are many more waiting for you. Keep applying and improving your skills.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 32px 40px;" align="center">
              <a href="${jobsUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                Explore More Opportunities
              </a>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                We appreciate your effort and wish you the best in your future endeavors.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

interface CertificateUploadedEmailData {
  studentName: string
  certificateTitle: string
  issuer: string
  issueDate: string
  internshipTitle: string
  companyName: string
  certificateUrl: string
  profileUrl: string
}

export function certificateUploadedTemplate(data: CertificateUploadedEmailData): string {
  const {
    studentName,
    certificateTitle,
    issuer,
    issueDate,
    internshipTitle,
    companyName,
    certificateUrl,
    profileUrl,
  } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Uploaded</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🏆 Certificate Uploaded!</h1>
              <p style="margin: 8px 0 0 0; color: #fef3c7; font-size: 14px;">Your internship certificate is now available</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
              <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Great news! Your internship certificate for <strong>${internshipTitle}</strong> at <strong>${companyName}</strong> has been uploaded to your profile.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fde68a;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; color: #b45309; font-size: 18px; font-weight: 600;">📜 Certificate Details</h2>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                          <span style="color: #d97706; font-size: 12px; font-weight: 600; text-transform: uppercase;">Certificate Title</span>
                          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 16px; font-weight: 500;">${certificateTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                          <span style="color: #d97706; font-size: 12px; font-weight: 600; text-transform: uppercase;">Issued By</span>
                          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 16px; font-weight: 500;">${issuer}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #fde68a;">
                          <span style="color: #d97706; font-size: 12px; font-weight: 600; text-transform: uppercase;">Issue Date</span>
                          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 16px; font-weight: 500;">${issueDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #d97706; font-size: 12px; font-weight: 600; text-transform: uppercase;">Internship</span>
                          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 14px;">${internshipTitle} at ${companyName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px;" align="center">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="padding-right: 12px;">
                    <a href="${certificateUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                      📄 View Certificate
                    </a>
                  </td>
                  <td>
                    <a href="${profileUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f1f5f9; color: #475569; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; border: 1px solid #e2e8f0;">
                      👤 Go to Profile
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #047857; font-size: 14px;">
                      <strong>✨ Pro Tip:</strong> Add this certificate to your LinkedIn profile to boost your visibility to recruiters!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                Congratulations on completing your internship! Keep up the great work.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Welcome Email Template
interface WelcomeEmailData {
  name: string
  email: string
  role: "student" | "faculty" | "placement-cell" | "employer"
  companyName?: string
  loginUrl: string
}

export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  const { name, email, role, companyName, loginUrl } = data

  const roleDisplayName: Record<string, string> = {
    student: "Student",
    faculty: "Faculty Mentor",
    "placement-cell": "Placement Cell Admin",
    employer: "Employer Representative",
  }

  const roleDescription: Record<string, string> = {
    student:
      "explore job opportunities, track your applications, manage your profile, and connect with potential employers",
    faculty:
      "mentor students, review and approve applications, and help guide students through their placement journey",
    "placement-cell":
      "manage the entire placement process, create opportunities, onboard companies, and oversee student placements",
    employer:
      "post job opportunities, review student applications, schedule interviews, and find the best talent for your organization",
  }

  const roleIcon: Record<string, string> = {
    student: "🎓",
    faculty: "👨‍🏫",
    "placement-cell": "🏛️",
    employer: "💼",
  }

  const roleColor: Record<string, { primary: string; light: string }> = {
    student: { primary: "#0ea5e9", light: "#f0f9ff" },
    faculty: { primary: "#8b5cf6", light: "#f5f3ff" },
    "placement-cell": { primary: "#10b981", light: "#ecfdf5" },
    employer: { primary: "#f59e0b", light: "#fffbeb" },
  }

  const colors = roleColor[role] || roleColor.student

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Placement Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, ${colors.primary} 0%, #3b82f6 100%); border-radius: 16px 16px 0 0; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${roleIcon[role]}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to Placement Portal!</h1>
              <p style="margin: 12px 0 0 0; color: #e0f2fe; font-size: 14px;">Your account has been created successfully</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <p style="margin: 0; color: #334155; font-size: 18px;">Hello <strong>${name}</strong>,</p>
              <p style="margin: 16px 0 0 0; color: #64748b; font-size: 15px; line-height: 1.7;">
                We're excited to have you on board! Your account has been set up as a <strong style="color: ${colors.primary};">${roleDisplayName[role]}</strong>${companyName ? ` at <strong>${companyName}</strong>` : ""}.
              </p>
            </td>
          </tr>

          <!-- Account Details Card -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${colors.light}; border-radius: 12px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">📋 Your Account Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 100px;">Email:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Role:</td>
                        <td style="padding: 8px 0;">
                          <span style="display: inline-block; padding: 4px 12px; background-color: ${colors.primary}; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 20px;">
                            ${roleDisplayName[role]}
                          </span>
                        </td>
                      </tr>
                      ${
                        companyName
                          ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Company:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">${companyName}</td>
                      </tr>
                      `
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What You Can Do -->
          <tr>
            <td style="padding: 24px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px; font-weight: 600;">🚀 What You Can Do</h3>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.7;">
                As a ${roleDisplayName[role].toLowerCase()}, you can ${roleDescription[role]}.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 8px 40px 32px 40px;" align="center">
              <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${colors.primary} 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                🔐 Login to Your Account
              </a>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px;">
                      <strong>🔒 Security Tip:</strong> Your temporary password was set by the administrator. We recommend changing it after your first login for better security.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-align: center;">
                If you have any questions, feel free to reach out to the placement cell.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Placement Portal. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}