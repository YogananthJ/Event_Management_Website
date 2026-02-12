import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import Collection from '@/components/shared/Collection'

export const metadata = {
  title: 'Explore Events'
}

const ExplorePage = async () => {
  await connectToDatabase()

  const events = await Event.find({ isPublished: true, isPublic: true }).sort({ createdAt: -1 }).lean()

  return (
    <section className="wrapper my-8">
      <h3 className="h3-bold mb-6">Explore</h3>
      <Collection
        data={events}
        emptyTitle="No public events"
        emptyStateSubtext="There are no public events at the moment."
        limit={12}
        page={1}
        collectionType="All_Events"
      />
    </section>
  )
}

export default ExplorePage
