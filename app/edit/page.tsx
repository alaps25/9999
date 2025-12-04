import { redirect } from 'next/navigation'
import { getMenuItems } from '@/lib/firebase/queries'

export default async function EditPage() {
  // Always redirect to the first page's edit route
  const menuItems = await getMenuItems()
  
  if (menuItems.length > 0) {
    // Use the menu item slug (defaults to "page" for first item)
    const firstPageSlug = menuItems[0].slug || 'page'
    redirect(`/${firstPageSlug}/edit`)
  }
  
  // Fallback: if no menu items exist, show empty state
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>No pages available. Please create a page first.</p>
    </div>
  )
}
