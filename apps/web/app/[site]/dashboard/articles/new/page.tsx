import { Editor } from '../../../../../components/editor/Editor'

interface Props {
  params: Promise<{ site: string }>
}

export default async function NewArticlePage({ params }: Props) {
  const resolvedParams = await params
  return (
    <main className="min-h-screen bg-white">
      <Editor articleId="new" siteId={resolvedParams.site} />
    </main>
  )
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params
  return { title: `Post Baru — ${resolvedParams.site} | BeritaKarya` }
}