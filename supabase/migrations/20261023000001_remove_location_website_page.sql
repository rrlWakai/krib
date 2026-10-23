-- The retired standalone pages are no longer managed independently.
DELETE FROM public.website_pages
WHERE slug IN ('about', 'location');
