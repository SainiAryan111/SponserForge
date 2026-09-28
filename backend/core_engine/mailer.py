import os
import json
import subprocess
import threading
import logging

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAILER_SCRIPT = os.path.join(BASE_DIR, 'mailer.js')


def _execute_node_mailer(payload):
    """Executes backend/mailer.js with Nodemailer JSON payload in background subprocess."""
    try:
        json_payload = json.dumps(payload)
        result = subprocess.run(
            ['node', MAILER_SCRIPT, json_payload],
            capture_output=True,
            text=True,
            timeout=15,
            cwd=BASE_DIR
        )
        if result.returncode == 0:
            logger.info(f"Nodemailer dispatch success: {result.stdout.strip()}")
        else:
            logger.error(f"Nodemailer dispatch error: {result.stderr.strip()}")
    except Exception as e:
        logger.error(f"Failed to execute Nodemailer script: {e}")


def send_email_async(to_email, subject, text_body, html_body):
    """Dispatches email asynchronously to avoid blocking Django HTTP request lifecycle."""
    if not to_email or not str(to_email).strip():
        logger.warning("No recipient email provided for Nodemailer notification.")
        return

    payload = {
        "to": str(to_email).strip(),
        "subject": subject,
        "text": text_body,
        "html": html_body
    }

    thread = threading.Thread(target=_execute_node_mailer, args=(payload,))
    thread.daemon = True
    thread.start()


# ==============================================================================
# HTML EMAIL TEMPLATES & DISPATCHERS
# ==============================================================================

def get_base_html(title, subtitle, body_content, accent_color="#dc2626"):
    """Returns a sleek, modern HTML email wrapper for SponsorForge platform."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{title}</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; margin: 0; padding: 0; color: #f4f4f5; }}
        .container {{ max-width: 600px; margin: 30px auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
        .header {{ background: linear-gradient(135deg, {accent_color}, #991b1b); padding: 32px 24px; text-align: center; color: #ffffff; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }}
        .header p {{ margin: 6px 0 0 0; font-size: 13px; font-weight: 600; opacity: 0.9; }}
        .body {{ padding: 32px 24px; color: #d4d4d8; font-size: 14px; line-height: 1.6; }}
        .card {{ background-color: #09090b; border: 1px solid #27272a; border-radius: 14px; padding: 20px; margin: 20px 0; }}
        .badge {{ display: inline-block; background-color: {accent_color}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .button {{ display: inline-block; background-color: {accent_color}; color: #ffffff !important; font-weight: 800; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 12px; margin-top: 16px; text-align: center; }}
        .footer {{ background-color: #09090b; border-top: 1px solid #27272a; padding: 20px; text-align: center; font-size: 12px; color: #71717a; }}
        .points-box {{ background: linear-gradient(135deg, #eab308, #ca8a04); color: #000000; font-weight: 900; font-size: 18px; padding: 8px 16px; border-radius: 10px; display: inline-block; margin-top: 10px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SponsorForge</h1>
          <p>{subtitle}</p>
        </div>
        <div class="body">
          {body_content}
        </div>
        <div class="footer">
          <p>&copy; 2026 SponsorForge Platform. Intelligent Creator-Brand Marketplace.</p>
        </div>
      </div>
    </body>
    </html>
    """


# ------------------------------------------------------------------------------
# 1. SUCCESSFUL SIGNUP EMAIL (FOR BRANDS & CREATORS)
# ------------------------------------------------------------------------------
def send_welcome_email(user_email, username, role):
    role_str = "Brand Partner" if role == 'brand' else "Content Creator"
    accent = "#2563eb" if role == 'brand' else "#dc2626"
    
    subject = f"Welcome to SponsorForge, @{username}!"
    text = f"Welcome to SponsorForge! Your account as a {role_str} has been successfully created."
    
    html_body = get_base_html(
        title="Welcome to SponsorForge",
        subtitle=f"Identity Verification & Setup Confirmed",
        accent_color=accent,
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0;">Welcome aboard, @{username}! 🎉</h2>
          <p>Your registration as a <strong>{role_str}</strong> on SponsorForge is complete.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Account Role:</strong> <span class="badge" style="background-color: {accent};">{role_str.upper()}</span></p>
            <p style="margin: 8px 0 0 0;"><strong>Username Handle:</strong> @{username}</p>
            <p style="margin: 8px 0 0 0;"><strong>Registered Email:</strong> {user_email}</p>
          </div>
          <p>You can now explore active campaigns, match with creators, submit work, and earn points on our platform.</p>
        """
    )
    send_email_async(user_email, subject, text, html_body)


# ------------------------------------------------------------------------------
# 20. On Successful Campaign Creation
def send_brand_campaign_created_notification(brand_email, brand_username, campaign_title, points_reward, target_niche, total_creators_needed=1):
    """Sends a confirmation email to the brand whenever a new sponsorship campaign is successfully launched."""
    subject = f"Campaign Successfully Created: '{campaign_title}'"
    text = f"Congratulations! Your campaign '{campaign_title}' ({points_reward} PTS reward) was successfully published on SponsorForge."
    
    html_body = get_base_html(
        title="Campaign Live!",
        subtitle="Sponsorship Campaign Published",
        accent_color="#2563eb",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello @{brand_username}! 🚀</h2>
          <p>Your new sponsorship campaign <strong>"{campaign_title}"</strong> is now active and live on SponsorForge.</p>
          <div class="card">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 800;">Campaign Details:</p>
            <p style="margin: 8px 0 4px 0; color: #ffffff;"><strong>Title:</strong> {campaign_title}</p>
            <p style="margin: 4px 0 4px 0; color: #ffffff;"><strong>Reward per Creator:</strong> <span style="color: #60a5fa; font-weight: 900;">{points_reward} PTS</span></p>
            <p style="margin: 4px 0 4px 0; color: #ffffff;"><strong>Target Niche:</strong> {target_niche or 'General'}</p>
            <p style="margin: 4px 0 0 0; color: #ffffff;"><strong>Creators Needed:</strong> {total_creators_needed}</p>
          </div>
          <p>Matching creators will now discover your campaign. You can track applications and match recommendations from your Brand Dashboard.</p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2A. On Campaign Request (Creator applies to Brand's Campaign)
def send_brand_application_notification(brand_email, brand_name, creator_username, campaign_title, pitch):
    subject = f"New Creator Application: @{creator_username} applied to '{campaign_title}'"
    text = f"Creator @{creator_username} applied to your campaign '{campaign_title}'. Pitch: {pitch}"
    
    html_body = get_base_html(
        title="New Application Received",
        subtitle="Campaign Application Alert",
        accent_color="#2563eb",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>Creator <strong>@{creator_username}</strong> has submitted an application pitch for your campaign <strong>"{campaign_title}"</strong>.</p>
          <div class="card">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 800;">Creator Pitch Detail:</p>
            <p style="margin: 8px 0 0 0; color: #ffffff; font-style: italic;">"{pitch}"</p>
          </div>
          <p>Log in to your Brand Dashboard to accept this proposal and assign deliverable guidelines.</p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2B. On Campaign Offer Acceptance/Rejection by Creator
def send_brand_offer_response_notification(brand_email, brand_name, creator_username, campaign_title, action):
    is_accepted = action == 'accepted'
    status_str = "ACCEPTED" if is_accepted else "DECLINED / REJECTED"
    accent = "#16a34a" if is_accepted else "#dc2626"
    
    subject = f"Direct Offer {status_str}: @{creator_username} for '{campaign_title}'"
    text = f"Creator @{creator_username} has {status_str.lower()} your direct campaign offer for '{campaign_title}'."
    
    html_body = get_base_html(
        title=f"Direct Offer {status_str}",
        subtitle="Creator Offer Response Alert",
        accent_color=accent,
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>Creator <strong>@{creator_username}</strong> has <strong>{status_str}</strong> your direct offer for <strong>"{campaign_title}"</strong>.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Campaign Title:</strong> {campaign_title}</p>
            <p style="margin: 8px 0 0 0;"><strong>Status Update:</strong> <span class="badge" style="background-color: {accent};">{status_str}</span></p>
          </div>
          <p>{'The creator is now hired and working on your campaign deliverables!' if is_accepted else 'You can review other available creators in the smart match directory.'}</p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2C. On Submitted Work Review
def send_brand_work_submitted_notification(brand_email, brand_name, creator_username, campaign_title, submission_link):
    subject = f"Work Submitted for Review: @{creator_username} on '{campaign_title}'"
    text = f"Creator @{creator_username} submitted their work link: {submission_link} for campaign '{campaign_title}'."
    
    html_body = get_base_html(
        title="Deliverable Work Submitted",
        subtitle="24-Hour Review Window Active",
        accent_color="#9333ea",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>Creator <strong>@{creator_username}</strong> has submitted their deliverable for <strong>"{campaign_title}"</strong>!</p>
          <div class="card">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 800;">Submission URL Link:</p>
            <p style="margin: 8px 0 0 0;"><a href="{submission_link}" target="_blank" style="color: #a855f7; font-weight: 800; text-decoration: underline;">{submission_link}</a></p>
          </div>
          <p style="background-color: #3b0764; border: 1px solid #7e22ce; padding: 12px; border-radius: 10px; color: #e9d5ff; font-size: 12px;">
            ⚠️ <strong>Review Window Notice:</strong> Please review and release reward points within 24 hours. If unreviewed, escrow points will be automatically released to creator.
          </p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2D. On Expiration
def send_brand_expiration_notification(brand_email, brand_name, campaign_title, creator_username):
    subject = f"Deliverable Expired: '{campaign_title}' (@{creator_username})"
    text = f"The deliverable deadline for campaign '{campaign_title}' assigned to @{creator_username} has expired."
    
    html_body = get_base_html(
        title="Deliverable Expired",
        subtitle="Deadline Missed Alert",
        accent_color="#dc2626",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>The submission deadline for <strong>"{campaign_title}"</strong> assigned to <strong>@{creator_username}</strong> has passed without work submission.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Status:</strong> <span class="badge" style="background-color: #dc2626;">EXPIRED</span></p>
            <p style="margin: 8px 0 0 0;"><strong>Assigned Creator:</strong> @{creator_username}</p>
          </div>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2E. On Completion
def send_brand_completion_notification(brand_email, brand_name, campaign_title, creator_username, points_reward):
    subject = f"Campaign Completed & Payout Released for '{campaign_title}'"
    text = f"You completed campaign '{campaign_title}' with @{creator_username} and released {points_reward} PTS."
    
    html_body = get_base_html(
        title="Campaign Completed",
        subtitle="Payout Escrow Disbursed",
        accent_color="#16a34a",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>Your campaign sponsorship <strong>"{campaign_title}"</strong> with <strong>@{creator_username}</strong> is now marked as <strong>COMPLETED</strong>.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Points Disbursed:</strong></p>
            <div class="points-box">{points_reward} PTS</div>
          </div>
          <p>Thank you for using SponsorForge!</p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# 2F. On Overall Campaign End (Completed or Cancelled)
def send_brand_campaign_ended_notification(brand_email, brand_name, campaign_title, status):
    status_str = "COMPLETED" if status == 'completed' else "CANCELLED"
    accent = "#16a34a" if status == 'completed' else "#71717a"
    
    subject = f"Campaign {status_str}: '{campaign_title}'"
    text = f"Your campaign '{campaign_title}' has officially ended with status: {status_str}."
    
    html_body = get_base_html(
        title=f"Campaign {status_str}",
        subtitle="Campaign Lifecycle Event",
        accent_color=accent,
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello {brand_name},</h2>
          <p>Your sponsorship campaign <strong>"{campaign_title}"</strong> has officially ended.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Final Status:</strong> <span class="badge" style="background-color: {accent};">{status_str}</span></p>
          </div>
          <p>Thank you for using SponsorForge to manage your creator sponsorships!</p>
        """
    )
    send_email_async(brand_email, subject, text, html_body)


# ------------------------------------------------------------------------------
# 3. CREATOR NOTIFICATIONS
# ------------------------------------------------------------------------------

# 3A. On Getting Direct Campaign Offer
def send_creator_direct_offer_notification(creator_email, creator_username, brand_name, campaign_title, points_reward):
    subject = f"Direct Campaign Offer from {brand_name} for '{campaign_title}'!"
    text = f"You received a direct campaign offer from {brand_name} for '{campaign_title}' offering {points_reward} PTS."
    
    html_body = get_base_html(
        title="Direct Offer Received",
        subtitle="Sponsorship Invitation Alert",
        accent_color="#dc2626",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Congratulations @{creator_username}! 🎉</h2>
          <p>Brand <strong>{brand_name}</strong> has invited you directly to collaborate on campaign <strong>"{campaign_title}"</strong>!</p>
          <div class="card">
            <p style="margin: 0;"><strong>Sponsor Brand:</strong> {brand_name}</p>
            <p style="margin: 8px 0 0 0;"><strong>Campaign Reward:</strong></p>
            <div class="points-box">{points_reward} PTS</div>
          </div>
          <p>Log in to your Creator Dashboard to review and accept or decline this offer.</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3B. On Campaign Application
def send_creator_application_confirmation(creator_email, creator_username, campaign_title, brand_name):
    subject = f"Application Submitted for '{campaign_title}'"
    text = f"Your application pitch for campaign '{campaign_title}' by {brand_name} was successfully submitted."
    
    html_body = get_base_html(
        title="Application Submitted",
        subtitle="Pitch Confirmation",
        accent_color="#dc2626",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Pitch Sent, @{creator_username}!</h2>
          <p>Your application pitch for <strong>"{campaign_title}"</strong> sponsored by <strong>{brand_name}</strong> has been delivered to the brand.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Status:</strong> <span class="badge" style="background-color: #0284c7;">PENDING REVIEW</span></p>
          </div>
          <p>You will be notified as soon as the brand reviews and responds to your pitch.</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3C. On Campaign Application Acceptance/Rejection by Brand
def send_creator_application_decision(creator_email, creator_username, campaign_title, brand_name, decision, work_description=None, submission_deadline=None):
    is_accepted = decision == 'accepted'
    status_str = "ACCEPTED & HIRED" if is_accepted else "REJECTED"
    accent = "#16a34a" if is_accepted else "#dc2626"
    
    subject = f"Application {status_str}: '{campaign_title}' by {brand_name}"
    text = f"Your application for '{campaign_title}' was {status_str.lower()} by {brand_name}."
    
    deadline_info = f"<p style='margin: 8px 0 0 0;'><strong>Submission Deadline:</strong> {submission_deadline}</p>" if submission_deadline else ""
    guidelines_info = f"<div class='card'><p style='margin: 0; font-size: 12px; color: #9ca3af; font-weight: 800; text-transform: uppercase;'>Deliverable Guidelines:</p><p style='margin: 8px 0 0 0; color: #ffffff;'>{work_description}</p>{deadline_info}</div>" if is_accepted and work_description else ""
    
    html_body = get_base_html(
        title=f"Application {status_str}",
        subtitle="Sponsorship Status Update",
        accent_color=accent,
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello @{creator_username},</h2>
          <p>Brand <strong>{brand_name}</strong> has <strong>{status_str}</strong> your application for <strong>"{campaign_title}"</strong>.</p>
          {guidelines_info}
          <p>{'Please review your instructions and submit your deliverable link before the countdown clock expires!' if is_accepted else 'Do not worry! Explore other matching campaigns on SponsorForge.'}</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3D. On Submitting the Work
def send_creator_work_submitted_confirmation(creator_email, creator_username, campaign_title, submission_link):
    subject = f"Work Submission Received: '{campaign_title}'"
    text = f"You successfully submitted your work link {submission_link} for campaign '{campaign_title}'."
    
    html_body = get_base_html(
        title="Deliverable Submitted",
        subtitle="24-Hour Review Clock Active",
        accent_color="#16a34a",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Great Job, @{creator_username}! 🚀</h2>
          <p>Your submission link for <strong>"{campaign_title}"</strong> has been successfully received.</p>
          <div class="card">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 800;">Submitted Link:</p>
            <p style="margin: 8px 0 0 0;"><a href="{submission_link}" target="_blank" style="color: #38bdf8; font-weight: 800;">{submission_link}</a></p>
          </div>
          <p>The brand has 24 hours to review your submission and release your reward points.</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3E. On Getting Review & Points on Successful Campaign
def send_creator_reward_and_review_notification(creator_email, creator_username, campaign_title, brand_name, points_reward, rating=5, feedback=""):
    subject = f"You Earned {points_reward} PTS! Campaign Completed for '{campaign_title}'"
    text = f"Congratulations! Brand {brand_name} approved your work for '{campaign_title}', rated you {rating}/5 stars, and paid {points_reward} PTS."
    
    stars = "⭐" * int(rating)
    feedback_block = f"<p style='margin: 8px 0 0 0; font-style: italic; color: #ffffff;'>\"{feedback}\"</p>" if feedback else ""
    
    html_body = get_base_html(
        title="Points Credited & Review Received",
        subtitle="Successful Sponsorship Payout",
        accent_color="#16a34a",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Congratulations @{creator_username}! 🎉</h2>
          <p>Brand <strong>{brand_name}</strong> approved your deliverable for <strong>"{campaign_title}"</strong> and released your points!</p>
          <div class="card">
            <p style="margin: 0;"><strong>Earned Reward:</strong></p>
            <div class="points-box">+{points_reward} PTS</div>
            <p style="margin: 16px 0 0 0;"><strong>Brand Rating:</strong> {stars} ({rating}/5 Stars)</p>
            {feedback_block}
          </div>
          <p>Your points balance has been updated!</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3E2. On Submitted Work Rejection by Brand
def send_creator_work_rejected_notification(creator_email, creator_username, campaign_title, brand_name, rejection_reason):
    subject = f"Work Submission Rejected for '{campaign_title}'"
    text = f"Hello @{creator_username}, brand {brand_name} reviewed your deliverable submission for '{campaign_title}' and rejected it. Reason: {rejection_reason}"
    
    html_body = get_base_html(
        title="Deliverable Rejected",
        subtitle="Work Review Update",
        accent_color="#dc2626",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello @{creator_username},</h2>
          <p>Brand <strong>{brand_name}</strong> reviewed your deliverable submission for <strong>"{campaign_title}"</strong> and marked it as <strong>REJECTED</strong>.</p>
          <div class="card">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: 800;">Rejection Reason & Feedback:</p>
            <p style="margin: 8px 0 0 0; color: #fca5a5; font-style: italic; font-weight: 600;">"{rejection_reason}"</p>
          </div>
          <p>Please review the feedback from the brand.</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)


# 3F. On Expiration
def send_creator_expiration_notification(creator_email, creator_username, campaign_title):
    subject = f"Submission Deadline Expired for '{campaign_title}'"
    text = f"Your deliverable deadline for campaign '{campaign_title}' has passed."
    
    html_body = get_base_html(
        title="Submission Deadline Expired",
        subtitle="Campaign Expired Notice",
        accent_color="#dc2626",
        body_content=f"""
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0;">Hello @{creator_username},</h2>
          <p>The submission window for <strong>"{campaign_title}"</strong> has expired without deliverable link submission.</p>
          <div class="card">
            <p style="margin: 0;"><strong>Status:</strong> <span class="badge" style="background-color: #dc2626;">EXPIRED</span></p>
          </div>
          <p>Keep track of your active deadlines in your Creator Dashboard for future deals.</p>
        """
    )
    send_email_async(creator_email, subject, text, html_body)
