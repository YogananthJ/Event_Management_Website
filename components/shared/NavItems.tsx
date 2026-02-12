"use client";

import { headerLinks } from '@/constants'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import useIsHost from '@/lib/hooks/useIsHost'

const NavItems = () => {
  const pathname = usePathname();
  const { isSignedIn } = useAuth()
  const isHost = useIsHost()

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => {
        // Public links are always shown
        if (link.public) {
          const isActive = pathname === link.route;
          return (
            <li key={link.route} className={`${isActive && 'text-primary-500'} flex-center p-medium-16 whitespace-nowrap`}>
              <Link href={link.route}>{link.label}</Link>
            </li>
          )
        }

        // Non-public links require authentication
        if (!isSignedIn) return null

        // If link requires a host, ensure user is host
        if (link.requiresHost && !isHost) return null

        const isActive = pathname === link.route;
        return (
          <li key={link.route} className={`${isActive && 'text-primary-500'} flex-center p-medium-16 whitespace-nowrap`}>
            <Link href={link.route}>{link.label}</Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavItems