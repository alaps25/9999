import { Sidebar } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { ProjectCard } from '@/components/content/ProjectCard'
import { Typography } from '@/components/ui/Typography'
import { getPortfolioData } from '@/lib/firebase/queries'
import styles from './page.module.scss'

export default async function Home() {
  const portfolioData = await getPortfolioData()

  return (
    <div className={styles.page}>
      <Sidebar menuItems={portfolioData.menuItems} />
      <MainContent>
        {/* Bio Section */}
        {portfolioData.bio && (
          <div className={styles.bioSection}>
            <Typography variant="body">
              {portfolioData.bio.text}
            </Typography>
          </div>
        )}

        {/* Projects Section */}
        <div className={styles.projectsSection}>
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

