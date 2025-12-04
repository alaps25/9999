import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Dropdown } from '@/components/ui/Dropdown'
import { getPortfolioData } from '@/lib/firebase/queries'
import styles from '../page.module.scss'

interface PageProps {
  params: {
    slug: string // This is now the menu item ID (pageId)
  }
}

export default async function Page({ params }: PageProps) {
  // slug is now the menu item ID directly
  const portfolioData = await getPortfolioData(params.slug)

  // Check if there's any content
  const hasContent = !!(portfolioData.bio?.text || portfolioData.sections.length > 0)

  // Insert options for the default add button
  const insertOptions = [
    { 
      label: 'V Card', 
      value: 'v-card'
    },
    { 
      label: 'H Card', 
      value: 'h-card'
    },
    { 
      label: 'Media', 
      value: 'media'
    },
    { 
      label: 'Slides', 
      value: 'slides'
    },
    { 
      label: 'Big text', 
      value: 'big-text'
    },
  ]

  return (
    <div className={styles.page}>
      <Sidebar menuItems={portfolioData.menuItems} />
      <MainContent>
        {/* Projects Section */}
        <div className={styles.projectsSection}>
          {/* Show default add button when there's no content */}
          {!hasContent && (
            <div className={styles.addProjectButton}>
              <Dropdown
                options={insertOptions}
                placeholder="Add"
                variant="low"
                size="md"
                alwaysShowPlaceholder={true}
                disabled={true} // Disabled in view mode
              />
            </div>
          )}

          {/* Bio Section as ProjectCard variant */}
          {portfolioData.bio && (
            <ProjectCard variant="bio" bioText={portfolioData.bio.text} />
          )}
          
          {portfolioData.sections.map((section) => {
            if (section.type === 'project' && section.project) {
              return (
                <ProjectCard key={section.id} project={section.project} />
              )
            }
            return null
          })}
        </div>
      </MainContent>
    </div>
  )
}

