# GigConnect User Workflows

## 1. User Registration & Authentication

### Client Registration
```
1. User visits registration page
2. Selects "Client" role
3. Fills basic info (name, email, password, location)
4. Email verification sent
5. User verifies email
6. Account activated → Dashboard
```

### Freelancer Registration
```
1. User visits registration page
2. Selects "Freelancer" role
3. Fills basic info + freelancer details
4. Uploads portfolio/resume (optional)
5. Adds skills and rates
6. Email verification
7. Profile review (optional)
8. Account activated → Dashboard
```

## 2. Gig Posting Workflow (Client)

```
Client Dashboard → Post Gig
    ↓
Fill Gig Details:
- Title & Description
- Category & Skills Required
- Budget (Fixed/Hourly)
- Location/Remote
- Deadline
- Attachments
    ↓
Review & Publish
    ↓
Gig Goes Live
    ↓
Receive Applications
    ↓
Review Freelancer Profiles
    ↓
Accept Application → Create Contract
    ↓
Project Starts
```

## 3. Gig Application Workflow (Freelancer)

```
Browse Gigs → Filter by:
- Location (radius)
- Skills
- Budget Range
- Category
- Urgency
    ↓
View Gig Details
    ↓
Apply to Gig:
- Cover Letter
- Proposed Rate
- Timeline
    ↓
Application Submitted
    ↓
Wait for Client Response
    ↓
If Accepted → Contract Created
If Rejected → Continue Browsing
```

## 4. Project Execution Workflow

```
Contract Created
    ↓
Freelancer Starts Work
    ↓
Real-time Communication via Chat
    ↓
Progress Updates & Milestones
    ↓
Work Completion
    ↓
Client Review & Approval
    ↓
Payment Processing
    ↓
Mutual Reviews & Ratings
    ↓
Contract Closed
```

## 5. Payment Workflow

```
Contract Completion
    ↓
Client Approves Work
    ↓
Payment Gateway Integration:
- Razorpay/Stripe Processing
- Platform Fee Deduction (5-10%)
- Freelancer Payment
    ↓
Transaction Records Updated
    ↓
Payment Confirmation
    ↓
Invoice Generation
```

## 6. Search & Discovery Workflow

### Location-Based Search
```
User Location Detection
    ↓
Set Search Radius (1km, 5km, 10km, 25km)
    ↓
PostGIS Query:
ST_DWithin(freelancer_location, user_location, radius)
    ↓
Results Sorted by:
- Distance
- Rating
- Price
- Availability
```

### Skill-Based Filtering
```
Select Skills → Filter freelancers with matching skills
Select Experience Level → Filter by years of experience
Select Price Range → Filter by hourly rates
Select Availability → Filter by current status
```

## 7. Real-time Messaging Workflow

```
User Initiates Chat
    ↓
Socket.io Connection Established
    ↓
Create/Join Conversation Room
    ↓
Send Message → Broadcast to Room
    ↓
Store Message in Database
    ↓
Real-time Delivery to Recipient
    ↓
Read Receipt Updates
    ↓
Push Notification (if offline)
```

## 8. Review & Rating Workflow

```
Contract Completion
    ↓
Both Parties Eligible to Review
    ↓
Submit Review:
- 1-5 Star Rating
- Written Feedback
- Categories (Communication, Quality, Timeliness)
    ↓
Review Moderation (optional)
    ↓
Publish Review
    ↓
Update User Reputation Score
    ↓
Display on Profile
```

## 9. Dispute Resolution Workflow

```
Issue Reported by Client/Freelancer
    ↓
Dispute Status: "Under Review"
    ↓
Evidence Collection:
- Chat History
- Work Deliverables
- Contract Terms
    ↓
Admin/Mediator Review
    ↓
Resolution Decision:
- Full Payment to Freelancer
- Partial Payment
- Full Refund to Client
    ↓
Payment Adjustment
    ↓
Case Closed
```

## 10. Notification System Workflow

### Real-time Notifications
- New gig applications
- Messages received
- Payment confirmations
- Review submissions

### Email Notifications
- Account verification
- Contract updates
- Payment receipts
- Weekly digest

### Push Notifications (Mobile)
- Urgent messages
- Gig deadlines
- Payment alerts