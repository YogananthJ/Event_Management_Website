'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

const populateEvent = (query: any) => {
  return query
    .populate({ path: 'createdBy', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()
    // userId is expected to be the app User _id here. If Clerk id is passed, resolve first.
    let creator = await User.findById(userId)
    if (!creator) {
      creator = await User.findOne({ clerkId: userId })
    }
    if (!creator) throw new Error('Organizer not found')
    if (creator.role !== 'admin') throw new Error('Forbidden')

    // generate unique code for event
    const generateCode = (len = 8) => Math.random().toString(36).slice(2, 2 + len).toUpperCase()
    let code = generateCode()
    while (await Event.findOne({ code })) code = generateCode()

    // Validate category
    if (!event.categoryId) throw new Error('Category is required')
    const category = await Category.findById(event.categoryId)
    if (!category) throw new Error('Category not found')

    const newEvent = await Event.create({ ...event, category: category._id, createdBy: creator._id, code })
    revalidatePath(path)

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    const event = await populateEvent(Event.findById(eventId))
    if (!event) throw new Error('Event not found')
    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()
    const eventToUpdate = await Event.findById(event._id)
    const creator = await User.findById(userId) || await User.findOne({ clerkId: userId })
    if (!eventToUpdate || !creator || eventToUpdate.createdBy.toString() !== creator._id.toString()) {
      throw new Error('Unauthorized or event not found')
    }

    // Validate category if provided
    let categoryIdToUse = event.categoryId
    if (event.categoryId) {
      const categoryExists = await Category.findById(event.categoryId)
      if (!categoryExists) throw new Error('Category not found')
      categoryIdToUse = categoryExists._id
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: categoryIdToUse },
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()
    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

// GET ALL EVENTS
export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : null
    const categoryCondition = category ? await getCategoryByName(category) : null
    const and: any[] = []
    if (titleCondition) and.push(titleCondition)
    if (categoryCondition) and.push({ category: categoryCondition._id })
    const conditions = and.length > 0 ? { $and: and } : {}

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()
    // userId may be Clerk user id; resolve to app user _id
    let user = await User.findById(userId)
    if (!user) user = await User.findOne({ clerkId: userId })
    if (!user) return { data: [], totalPages: 0 }

    const conditions = { createdBy: user._id }
    const skipAmount = (page - 1) * limit

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}
