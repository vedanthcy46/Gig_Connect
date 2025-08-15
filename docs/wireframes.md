# GigConnect Wireframes

## 1. Landing Page
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] GigConnect                    [Login] [Sign Up]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           Find Local Freelancers Near You                  │
│              Connect. Collaborate. Create.                  │
│                                                             │
│    [Search Location] [Browse Categories] [Get Started]      │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   For       │ │    For      │ │   Popular   │          │
│  │  Clients    │ │ Freelancers │ │ Categories  │          │
│  │             │ │             │ │             │          │
│  │ • Post Gigs │ │ • Find Work │ │ • Web Dev   │          │
│  │ • Find Pros │ │ • Build Rep │ │ • Design    │          │
│  │ • Secure $$ │ │ • Get Paid  │ │ • Writing   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
│              How GigConnect Works                           │
│  [1. Post/Browse] → [2. Connect] → [3. Complete] → [4. Pay]│
└─────────────────────────────────────────────────────────────┘
```

## 2. Registration Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    Join GigConnect                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  I want to:                                                 │
│  ○ Hire freelancers (Client)                               │
│  ○ Find work (Freelancer)                                  │
│  ○ Both                                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ First Name: [________________]                      │   │
│  │ Last Name:  [________________]                      │   │
│  │ Email:      [________________]                      │   │
│  │ Password:   [________________]                      │   │
│  │ Location:   [________________] [Use Current]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Continue] [Already have account? Sign in]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Freelancer Profile Setup                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Professional Title: [_________________________]            │
│  Bio: [____________________________________________]        │
│       [____________________________________________]        │
│                                                             │
│  Skills: [Web Development] [×] [Graphic Design] [×]         │
│         [+ Add Skill]                                       │
│                                                             │
│  Hourly Rate: $[____]/hour                                  │
│  Experience: [____] years                                   │
│                                                             │
│  Portfolio: [Upload Files] [Add URL]                        │
│                                                             │
│  [Complete Profile] [Skip for now]                          │
└─────────────────────────────────────────────────────────────┘
```

## 3. Dashboard - Client View
```
┌─────────────────────────────────────────────────────────────┐
│ GigConnect    [Notifications] [Messages] [Profile ▼]        │
├─────────────────────────────────────────────────────────────┤
│ [Browse Gigs] [Find Freelancers] [+ Post Gig] [My Gigs]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Find Freelancers Near You                                   │
│                                                             │
│ [Search...] [Category ▼] [Radius: 25km ▼] [More Filters]   │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ [Avatar]    │ │ [Avatar]    │ │ [Avatar]    │            │
│ │ John Smith  │ │ Sarah Lee   │ │ Mike Chen   │            │
│ │ Web Dev     │ │ Designer    │ │ Writer      │            │
│ │ $50/hr      │ │ $40/hr      │ │ $30/hr      │            │
│ │ ★★★★★ (25)  │ │ ★★★★☆ (18)  │ │ ★★★★★ (32)  │            │
│ │ 2.5km away  │ │ 1.8km away  │ │ 3.2km away  │            │
│ │ [Contact]   │ │ [Contact]   │ │ [Contact]   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ [Load More]                                                 │
└─────────────────────────────────────────────────────────────┘
```

## 4. Dashboard - Freelancer View
```
┌─────────────────────────────────────────────────────────────┐
│ GigConnect    [Notifications] [Messages] [Profile ▼]        │
├─────────────────────────────────────────────────────────────┤
│ [Browse Gigs] [My Applications] [Active Contracts] [Earnings]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Available Gigs Near You                                     │
│                                                             │
│ [Search...] [Category ▼] [Budget ▼] [Distance ▼] [Filters] │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Website Redesign Project                    [URGENT]    │ │
│ │ Need a modern, responsive website for my business...    │ │
│ │                                                         │ │
│ │ Skills: [Web Dev] [UI/UX] [React]                      │ │
│ │ Budget: $500-800 | 📍 2.1km | ⏰ 5 days | 👤 Jane Doe │ │
│ │ Posted 2 hours ago                        [Apply Now]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Logo Design for Startup                     [MEDIUM]    │ │
│ │ Looking for creative logo design for tech startup...    │ │
│ │                                                         │ │
│ │ Skills: [Design] [Branding] [Illustrator]              │ │
│ │ Budget: $200-400 | 📍 Remote | ⏰ 3 days | 👤 Tom Lee  │ │
│ │ Posted 4 hours ago                        [Apply Now]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 5. Gig Posting Form
```
┌─────────────────────────────────────────────────────────────┐
│                      Post a New Gig                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Gig Title: [_________________________________________]       │
│                                                             │
│ Category: [Web Development ▼]                               │
│                                                             │
│ Description:                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Describe your project in detail...                      │ │
│ │                                                         │ │
│ │                                                         │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Required Skills: [React] [×] [Node.js] [×] [+ Add Skill]   │
│                                                             │
│ Budget Type: ○ Fixed Price  ○ Hourly Rate                  │
│ Budget Range: $[____] to $[____]                           │
│                                                             │
│ Location: ○ Remote  ○ On-site  ○ Hybrid                    │
│ Address: [_________________________________________]         │
│                                                             │
│ Deadline: [MM/DD/YYYY]                                      │
│ Urgency: ○ Low  ○ Medium  ○ High                           │
│                                                             │
│ Attachments: [Upload Files]                                 │
│                                                             │
│ [Save Draft] [Preview] [Publish Gig]                       │
└─────────────────────────────────────────────────────────────┘
```

## 6. Freelancer Profile Page
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]                                    [Message] [Hire]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐  John Smith                                 │
│ │   [Avatar]  │  Senior Web Developer                       │
│ │             │  ★★★★★ 4.9 (127 reviews)                   │
│ │             │  📍 2.5km away • Available                  │
│ └─────────────┘  $65/hour • 5 years experience             │
│                                                             │
│ About:                                                      │
│ Full-stack developer specializing in React, Node.js, and   │
│ modern web technologies. I help businesses build scalable  │
│ web applications with clean, maintainable code.            │
│                                                             │
│ Skills:                                                     │
│ [React] [Node.js] [JavaScript] [Python] [PostgreSQL]       │
│ [AWS] [Docker] [Git] [REST APIs] [GraphQL]                 │
│                                                             │
│ Portfolio:                                                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ E-commerce  │ │ SaaS App    │ │ Mobile App  │            │
│ │ Platform    │ │ Dashboard   │ │ React Native│            │
│ │ [View]      │ │ [View]      │ │ [View]      │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ Recent Reviews:                                             │
│ ★★★★★ "Excellent work, delivered on time!" - Sarah K.      │
│ ★★★★★ "Great communication and quality code." - Mike R.    │
│                                                             │
│ [View All Reviews] [Report User]                            │
└─────────────────────────────────────────────────────────────┘
```

## 7. Messaging Interface
```
┌─────────────────────────────────────────────────────────────┐
│ Messages                                          [× Close] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ │                                           │
│ │ Conversations│ │ Chat with Sarah Lee                      │
│ ├─────────────┤ │ ○ Online                                 │
│ │ Sarah Lee   │ │                                           │
│ │ Logo project│ │ ┌─────────────────────────────────────┐   │
│ │ 2 min ago   │ │ │ Hi! I saw your gig posting for     │   │
│ │             │ │ │ logo design. I'd love to help!     │   │
│ ├─────────────┤ │ └─────────────────────────────────────┘   │
│ │ Mike Chen   │ │                                    10:30 AM│
│ │ Website dev │ │                                           │
│ │ 1 hour ago  │ │ ┌─────────────────────────────────────┐   │
│ │             │ │ │ Great! Can you share some examples │   │
│ ├─────────────┤ │ │ of your previous work?             │   │
│ │ Tom Wilson  │ │ └─────────────────────────────────────┘   │
│ │ Content     │ │                                    10:32 AM│
│ │ 2 days ago  │ │                                           │
│ │             │ │ ┌─────────────────────────────────────┐   │
│ └─────────────┘ │ │ Sure! Here's my portfolio link:    │   │
│                 │ │ www.sarahdesigns.com               │   │
│                 │ └─────────────────────────────────────┘   │
│                 │                                    10:35 AM│
│                 │                                           │
│                 │ [Type a message...] [📎] [Send]           │
└─────────────────────────────────────────────────────────────┘
```

## 8. Mobile App - Home Screen
```
┌─────────────────────┐
│ ☰ GigConnect    🔔  │
├─────────────────────┤
│                     │
│ Welcome back, John! │
│                     │
│ ┌─────────────────┐ │
│ │ Quick Actions   │ │
│ │ [Browse Gigs]   │ │
│ │ [Find Talent]   │ │
│ │ [Post Gig]      │ │
│ │ [Messages]      │ │
│ └─────────────────┘ │
│                     │
│ Nearby Gigs:        │
│ ┌─────────────────┐ │
│ │ Website Redesign│ │
│ │ $500-800        │ │
│ │ 2.1km away      │ │
│ │ [Apply]         │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Logo Design     │ │
│ │ $200-400        │ │
│ │ Remote          │ │
│ │ [Apply]         │ │
│ └─────────────────┘ │
│                     │
│ [View All Gigs]     │
│                     │
├─────────────────────┤
│ [🏠] [🔍] [💬] [👤] │
└─────────────────────┘
```

## 9. Payment & Contract Screen
```
┌─────────────────────────────────────────────────────────────┐
│                    Contract Details                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Project: Website Redesign                                   │
│ Client: Jane Doe                                            │
│ Freelancer: John Smith                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Contract Terms:                                         │ │
│ │ • Fixed price: $650                                     │ │
│ │ • Deadline: March 15, 2024                             │ │
│ │ • Deliverables: Responsive website with 5 pages        │ │
│ │ • Revisions: Up to 3 rounds included                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Payment Breakdown:                                          │
│ Project Amount:           $650.00                           │
│ Platform Fee (5%):        $32.50                           │
│ Total:                    $682.50                           │
│                                                             │
│ Payment Method:                                             │
│ ○ Credit Card  ○ PayPal  ○ Bank Transfer                   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Card Number: [____-____-____-____]                     │ │
│ │ Expiry: [MM/YY]  CVV: [___]                            │ │
│ │ Name: [_________________________]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ I agree to the Terms of Service and Privacy Policy       │
│                                                             │
│ [Cancel] [Confirm & Pay]                                    │
└─────────────────────────────────────────────────────────────┘
```

## 10. Review & Rating Screen
```
┌─────────────────────────────────────────────────────────────┐
│                   Leave a Review                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Project: Website Redesign                                   │
│ Freelancer: John Smith                                      │
│                                                             │
│ How was your experience?                                    │
│                                                             │
│ Overall Rating:                                             │
│ ★★★★★                                                       │
│                                                             │
│ Rate specific aspects:                                      │
│ Communication:    ★★★★★                                     │
│ Quality of Work:  ★★★★★                                     │
│ Timeliness:       ★★★★☆                                     │
│ Professionalism:  ★★★★★                                     │
│                                                             │
│ Written Review:                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ John delivered excellent work on time. Great            │ │
│ │ communication throughout the project and the final      │ │
│ │ website exceeded my expectations. Highly recommended!   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ I would work with this freelancer again                  │
│ ☑ I would recommend this freelancer to others              │
│                                                             │
│ [Cancel] [Submit Review]                                    │
└─────────────────────────────────────────────────────────────┘
```

These wireframes provide a comprehensive visual guide for the GigConnect platform, covering all major user flows and interactions across web and mobile interfaces.