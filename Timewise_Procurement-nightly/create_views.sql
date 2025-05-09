-- Create expiring_memberships view
CREATE OR REPLACE VIEW public.expiring_memberships AS
SELECT 
  member_id, 
  first_name, 
  last_name, 
  email,
  membership_type, 
  join_date, 
  expiration_date,
  status,
  (expiration_date - CURRENT_DATE) AS days_remaining
FROM 
  public.members
WHERE 
  status = 'active' 
  AND expiration_date < (CURRENT_DATE + interval '30 days');

-- Create member_engagement view
CREATE OR REPLACE VIEW public.member_engagement AS
SELECT 
  m.member_id,
  m.first_name,
  m.last_name,
  m.email,
  m.membership_type,
  m.join_date,
  m.status,
  m.points,
  COUNT(al.log_id) AS total_activities,
  MAX(al.activity_date) AS latest_activity,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - MAX(al.activity_date)))::INTEGER AS days_since_last_activity,
  COALESCE(SUM(al.amount_spent), 0) AS total_spent,
  COUNT(CASE WHEN al.activity_type = 'event_attendance' THEN 1 END) AS events_attended,
  COUNT(CASE WHEN al.activity_type = 'referral' THEN 1 END) AS referrals_made
FROM 
  public.members m
LEFT JOIN 
  public.activity_log al ON m.member_id = al.member_id
GROUP BY 
  m.member_id, m.first_name, m.last_name, m.email, m.membership_type, m.join_date, m.status, m.points
ORDER BY
  total_activities DESC;
