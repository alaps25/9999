'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sidebar, MobileMenuButton } from '@/components/layout/Sidebar'
import { MainContent } from '@/components/layout/MainContent'
import { Typography } from '@/components/ui/Typography'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { getMenuItems } from '@/lib/firebase/queries'
import { getSecondaryMenuItems, getMenuItemsWithSearch } from '@/lib/utils/navigation'
import { getPortfolioUrl, shareUrl } from '@/lib/utils/share'
import type { MenuItem } from '@/lib/firebase/types'
import styles from './page.module.scss'

function AboutContent() {
  const { user, userData } = useAuth()
  const isMobile = useIsMobile()
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    async function loadMenuItems() {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      try {
        const items = await getMenuItems(user.uid)
        setMenuItems(items)
      } catch (error) {
        console.error('Error loading menu items:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMenuItems()
  }, [user?.uid])

  const handleShareClick = async () => {
    if (!userData?.username) return
    const portfolioUrl = getPortfolioUrl(userData.username)
    await shareUrl(portfolioUrl, `Check out ${userData.username}'s portfolio`)
  }

  // Generate hrefs for menu items using username, with Search at the bottom
  const menuItemsWithHrefs = userData?.username
    ? getMenuItemsWithSearch(menuItems, userData.username)
    : menuItems.map(item => ({
        ...item,
        href: '#',
        isActive: false
      }))

  // Secondary menu items
  const secondaryMenuItems = getSecondaryMenuItems(handleShareClick, '/about')

  if (loading) {
    return (
      <div className={styles.page}>
        <Sidebar 
          menuItems={[]} 
          secondaryMenuItems={secondaryMenuItems}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={setMobileMenuOpen}
        />
        <MainContent>
          {isMobile && (
            <div className={styles.mobileHeader}>
              <div className={styles.mobileHeaderTitle}>About</div>
              <MobileMenuButton 
                isOpen={mobileMenuOpen} 
                onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                menuItems={[]}
                secondaryMenuItems={secondaryMenuItems}
              />
            </div>
          )}
          <div className={styles.settingsContainer}>
            <div>Loading...</div>
          </div>
        </MainContent>
      </div>
    )
  }

  const accordionItems: AccordionItem[] = [
    {
      title: 'About',
      defaultOpen: true,
      content: (
        <>
          <p>
            Wires is a modern portfolio website builder that empowers creators, designers, and professionals to showcase their work online with beautiful, customizable portfolio pages.
          </p>
          <p>
            Our platform provides an intuitive interface for building and managing your digital portfolio, with features designed to help you present your work in the best possible light.
          </p>
        </>
      ),
    },
    {
      title: 'Creator',
      content: (
        <>
          <p>
            Wires was created to provide a simple, elegant way for creators, designers, and professionals to showcase their work online. We believe that everyone deserves a beautiful, professional portfolio without the complexity of traditional website builders.
          </p>
          <p>
            Our mission is to make portfolio creation accessible, fast, and enjoyable, allowing you to focus on what matters most—your work.
          </p>
        </>
      ),
    },
    {
      title: 'Support',
      content: (
        <>
          <p>
            We&apos;re here to help! If you have questions, need support, or want to provide feedback, please reach out through our support channels.
          </p>
          <p>
            <strong>Support Tiers:</strong>
          </p>
          <ul>
            <li><strong>Base Plan:</strong> Community support via documentation and forums</li>
            <li><strong>Mid Plan:</strong> Email support with standard response times</li>
            <li><strong>Pro Plan:</strong> Priority email support with faster response times</li>
          </ul>
          <p>
            For urgent issues or account-related inquiries, please contact us directly through your account dashboard.
          </p>
        </>
      ),
    },
    {
      title: 'Privacy Policy',
      content: (
        <>
          <p>
            <strong>Data Collection and Use</strong>
          </p>
          <p>
            We respect your privacy and are committed to protecting your personal information. When you use Wires, we collect information necessary to provide and improve our services, including:
          </p>
          <ul>
            <li>Account information (email address, username)</li>
            <li>Portfolio content you create and upload</li>
            <li>Usage data to improve our services</li>
            <li>Payment information (processed securely through third-party providers)</li>
          </ul>
          
          <p>
            <strong>Data Storage and Security</strong>
          </p>
          <p>
            Your portfolio content is stored securely using industry-standard encryption. Content is only accessible to you unless you explicitly choose to make it public. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <p>
            <strong>Data Sharing</strong>
          </p>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
          </ul>
          
          <p>
            <strong>Your Rights</strong>
          </p>
          <p>
            You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or object to certain processing activities.
          </p>
          
          <p>
            <strong>Cookies and Tracking</strong>
          </p>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.
          </p>
          
          <p>
            <strong>Changes to Privacy Policy</strong>
          </p>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date.
          </p>
        </>
      ),
    },
    {
      title: 'Terms of Use',
      content: (
        <>
          <p>
            <strong>Acceptance of Terms</strong>
          </p>
          <p>
            By accessing and using Wires, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service.
          </p>
          
          <p>
            <strong>User Accounts</strong>
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information when creating your account</li>
            <li>Keep your account information up to date</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all content posted under your account</li>
          </ul>
          
          <p>
            <strong>User Content</strong>
          </p>
          <p>
            You retain ownership of all content you upload to Wires. By uploading content, you grant us a license to store, display, and distribute your content as necessary to provide our services. You represent and warrant that:
          </p>
          <ul>
            <li>You own or have the right to use all content you upload</li>
            <li>Your content does not violate any laws or third-party rights</li>
            <li>Your content does not contain malicious code, viruses, or harmful components</li>
            <li>Your content complies with our content guidelines</li>
          </ul>
          
          <p>
            <strong>Prohibited Uses</strong>
          </p>
          <p>
            You agree not to use Wires to:
          </p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon intellectual property rights</li>
            <li>Upload illegal, harmful, or offensive content</li>
            <li>Spam, harass, or abuse other users</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the service</li>
            <li>Use automated systems to access the service without permission</li>
          </ul>
          
          <p>
            <strong>Content Removal</strong>
          </p>
          <p>
            We reserve the right to remove any content that violates these terms or applicable laws. We may suspend or terminate accounts that repeatedly violate these terms.
          </p>
          
          <p>
            <strong>Service Availability</strong>
          </p>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or modifications that temporarily affect service availability.
          </p>
          
          <p>
            <strong>Subscription and Billing</strong>
          </p>
          <p>
            Subscription fees are billed in advance according to your selected plan. You may cancel your subscription at any time, and cancellation will take effect at the end of your current billing period. Refunds are provided according to our refund policy.
          </p>
          
          <p>
            <strong>Limitation of Liability</strong>
          </p>
          <p>
            To the maximum extent permitted by law, Wires shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
          </p>
          
          <p>
            <strong>Changes to Terms</strong>
          </p>
          <p>
            We may modify these Terms of Use at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
          </p>
        </>
      ),
    },
    {
      title: 'Copyright and Intellectual Property',
      content: (
        <>
          <p>
            <strong>Your Content</strong>
          </p>
          <p>
            You retain all ownership rights to the content you create and upload to Wires. We do not claim ownership of your content. You are free to use, modify, and distribute your content as you see fit.
          </p>
          
          <p>
            <strong>Platform Intellectual Property</strong>
          </p>
          <p>
            The Wires platform, including its design, functionality, code, and branding, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our platform without explicit written permission.
          </p>
          
          <p>
            <strong>Third-Party Content</strong>
          </p>
          <p>
            If you believe that content on Wires infringes your intellectual property rights, please contact us with:
          </p>
          <ul>
            <li>A description of the copyrighted work or intellectual property</li>
            <li>The location of the allegedly infringing content</li>
            <li>Your contact information</li>
            <li>A statement of good faith belief that the use is not authorized</li>
            <li>A statement that the information is accurate and you are authorized to act on behalf of the rights holder</li>
          </ul>
          
          <p>
            <strong>License to Use Your Content</strong>
          </p>
          <p>
            By uploading content to Wires, you grant us a non-exclusive, worldwide, royalty-free license to store, display, and distribute your content solely for the purpose of providing our services to you.
          </p>
        </>
      ),
    },
    {
      title: 'Refund Policy',
      content: (
        <>
          <p>
            <strong>Subscription Refunds</strong>
          </p>
          <p>
            We offer refunds for subscription fees under the following conditions:
          </p>
          <ul>
            <li><strong>Within 14 days:</strong> Full refund available for any reason</li>
            <li><strong>After 14 days:</strong> Pro-rated refunds may be available for the remaining unused portion of your subscription period</li>
            <li><strong>Service issues:</strong> If we fail to provide the service as described, you may be eligible for a full or partial refund</li>
          </ul>
          
          <p>
            <strong>Refund Process</strong>
          </p>
          <p>
            To request a refund, please contact our support team through your account dashboard. Refunds will be processed to the original payment method within 5-10 business days.
          </p>
          
          <p>
            <strong>Non-Refundable Items</strong>
          </p>
          <p>
            The following are not eligible for refunds:
          </p>
          <ul>
            <li>Consumed storage or bandwidth beyond your plan limits</li>
            <li>Third-party services or add-ons</li>
            <li>Accounts terminated for violation of Terms of Use</li>
          </ul>
        </>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Sidebar 
        menuItems={menuItemsWithHrefs} 
        secondaryMenuItems={secondaryMenuItems}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={setMobileMenuOpen}
      />
      <MainContent>
        {isMobile && (
          <div className={styles.mobileHeader}>
            <div className={styles.mobileHeaderTitle}>About</div>
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              menuItems={menuItemsWithHrefs}
              secondaryMenuItems={secondaryMenuItems}
            />
          </div>
        )}
        <div className={styles.settingsContainer}>
          <Accordion items={accordionItems} />
        </div>
      </MainContent>
    </div>
  )
}

export default function AboutPage() {
  return (
    <ProtectedRoute>
      <AboutContent />
    </ProtectedRoute>
  )
}

