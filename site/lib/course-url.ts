const basePath = process.env.NEXT_PUBLIC_COURSE_BASE_PATH ?? '';

export function courseUrl(path: string) {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    (basePath && (path === basePath || path.startsWith(`${basePath}/`)))
  )
    return path;
  return `${basePath}${path}`;
}
