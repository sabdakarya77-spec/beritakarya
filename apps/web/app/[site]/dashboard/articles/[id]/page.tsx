import { Editor } from '../../../../../components/editor/Editor'

interface Props {
  params: Promise<{ site: string; id: string }>
}

export default async function ArticleEditorPage({ params }: Props) {
  const resolvedParams = await params
  return (
    <main className="min-h-screen bg-white">
      <Editor articleId={resolvedParams.id} siteId={resolvedParams.site} />
    </main>
  )
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params
  return { title: `Editor — ${resolvedParams.site} | BeritaKarya` }
}