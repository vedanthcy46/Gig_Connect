# GigConnect ER Diagram

## Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      USERS      │    │     SKILLS      │    │      GIGS       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ client_id (FK)  │
│ password_hash   │    │ category        │    │ title           │
│ role            │    │ created_at      │    │ description     │
│ first_name      │    └─────────────────┘    │ category        │
│ last_name       │           │               │ budget_min      │
│ phone           │           │               │ budget_max      │
│ profile_image   │           │               │ budget_type     │
│ location        │           │               │ location        │
│ address         │           │               │ address         │
│ city            │           │               │ is_remote       │
│ state           │           │               │ urgency         │
│ country         │           │               │ status          │
│ is_verified     │           │               │ deadline        │
│ is_active       │           │               │ required_skills │
│ created_at      │           │               │ attachments     │
│ updated_at      │           │               │ created_at      │
└─────────────────┘           │               │ updated_at      │
         │                    │               └─────────────────┘
         │                    │                        │
         │                    │                        │
         │            ┌───────────────┐                │
         │            │FREELANCER_    │                │
         │            │   SKILLS      │                │
         │            ├───────────────┤                │
         │            │freelancer_id  │                │
         │            │skill_id (FK)  │                │
         │            │proficiency_   │                │
         │            │   level       │                │
         │            └───────────────┘                │
         │                    │                        │
         │                    │                        │
┌─────────────────┐           │               ┌─────────────────┐
│ FREELANCER_     │           │               │ GIG_APPLICATIONS│
│   PROFILES      │           │               ├─────────────────┤
├─────────────────┤           │               │ id (PK)         │
│ id (PK)         │───────────┘               │ gig_id (FK)     │
│ user_id (FK)    │                           │ freelancer_id   │
│ title           │                           │ cover_letter    │
│ bio             │                           │ proposed_rate   │
│ hourly_rate     │                           │ estimated_      │
│ availability    │                           │   duration      │
│ experience_years│                           │ status          │
│ portfolio_url   │                           │ applied_at      │
│ resume_url      │                           └─────────────────┘
│ total_earnings  │                                    │
│ total_jobs      │                                    │
│ success_rate    │                                    │
│ response_time   │                                    │
│ created_at      │                                    │
│ updated_at      │                                    │
└─────────────────┘                                    │
         │                                             │
         │                                             │
         │                    ┌─────────────────┐     │
         │                    │   CONTRACTS     │     │
         │                    ├─────────────────┤     │
         │                    │ id (PK)         │─────┘
         │                    │ gig_id (FK)     │
         │                    │ client_id (FK)  │
         │                    │ freelancer_id   │
         │                    │ agreed_rate     │
         │                    │ start_date      │
         │                    │ end_date        │
         │                    │ status          │
         │                    │ payment_status  │
         │                    │ created_at      │
         │                    │ updated_at      │
         │                    └─────────────────┘
         │                             │
         │                             │
         │                    ┌─────────────────┐
         │                    │    REVIEWS      │
         │                    ├─────────────────┤
         │                    │ id (PK)         │
         │                    │ contract_id (FK)│
         │                    │ reviewer_id (FK)│
         │                    │ reviewee_id (FK)│
         │                    │ rating          │
         │                    │ comment         │
         │                    │ review_type     │
         │                    │ created_at      │
         │                    └─────────────────┘
         │
         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ CONVERSATIONS   │    │    MESSAGES     │    │ TRANSACTIONS    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ participant_1   │────│ conversation_id │    │ contract_id (FK)│
│ participant_2   │    │ sender_id (FK)  │    │ payer_id (FK)   │
│ last_message_at │    │ content         │    │ payee_id (FK)   │
│ created_at      │    │ message_type    │    │ amount          │
└─────────────────┘    │ attachment_url  │    │ platform_fee    │
                       │ is_read         │    │ payment_gateway │
                       │ created_at      │    │ gateway_trans_id│
                       └─────────────────┘    │ status          │
                                              │ transaction_type│
                                              │ created_at      │
                                              └─────────────────┘

┌─────────────────┐
│ NOTIFICATIONS   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ title           │
│ message         │
│ type            │
│ reference_id    │
│ is_read         │
│ created_at      │
└─────────────────┘
```

## Key Relationships

1. **Users** can be clients, freelancers, or both
2. **Freelancer Profiles** extend user data for freelancers
3. **Skills** are linked to freelancers via many-to-many relationship
4. **Gigs** are posted by clients and applied to by freelancers
5. **Contracts** are created when gig applications are accepted
6. **Reviews** are bidirectional between clients and freelancers
7. **Conversations** enable real-time messaging between users
8. **Transactions** track all payment activities
9. **Notifications** keep users informed of platform activities

## Location-Based Features

- Users and Gigs store location as PostGIS GEOGRAPHY points
- Enables radius-based searches using ST_DWithin function
- Supports distance calculations and sorting by proximity