export const normalizePath = (path: string) => {
    let normalizedPath = path.replace(/\\/g, "/");
    // Only add the extra slash if there's exactly one slash after the drive letter (e.g. "F:/...").
    // If there are already two slashes (e.g. "F://..."), this will not add another.
    normalizedPath = normalizedPath.replace(/^([A-Za-z]):(?!\/\/)(\/)/, "$1://");
    return normalizedPath;
};