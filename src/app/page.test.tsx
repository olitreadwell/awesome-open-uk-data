import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import HomePage from '@/app/page';
import { getSiteConfig } from '@/lib/site-config';

describe('HomePage', () => {
  it('renders the title and search box', async () => {
    const element = await HomePage();
    render(element);
    const config = getSiteConfig();
    expect(
      screen.getByRole('heading', { name: new RegExp(`${config.thingPlural} in ${config.city}`) })
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search listings' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const element = await HomePage();
    const { container } = render(element);
    expect(await axe(container)).toHaveNoViolations();
  });
});
