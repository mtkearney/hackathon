import { Octokit } from 'octokit';

// Initialize Octokit with GitHub token if available
const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY || '',
});

/**
 * Parses a GitHub URL into owner and repo parts
 * 
 * @param url - GitHub repository URL
 * @returns Object containing owner and repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Handle different GitHub URL formats
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubRegex);
    
    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

/**
 * Fetches repository tags from GitHub
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @returns Array of tag names
 */
export async function fetchRepositoryTags(
  ownerAndRepo: string | { owner: string; repo: string }
): Promise<string[]> {
  try {
    let owner: string;
    let repo: string;
    
    if (typeof ownerAndRepo === 'string') {
      const parsed = parseGitHubUrl(ownerAndRepo);
      if (!parsed) return [];
      
      owner = parsed.owner;
      repo = parsed.repo;
    } else {
      owner = ownerAndRepo.owner;
      repo = ownerAndRepo.repo;
    }
    
    // If no GitHub token is provided, return mock data
    if (!process.env.GITHUB_API_KEY) {
      console.warn('No GitHub API key provided, returning mock tags');
      return ['v1.0', 'stable', 'beta', 'feature', 'bug', 'documentation', 'setup', 'testing'];
    }
    
    const response = await octokit.rest.repos.listTags({
      owner,
      repo,
      per_page: 100,
    });
    
    return response.data.map(tag => tag.name);
  } catch (error) {
    console.error('Error fetching repository tags:', error);
    return [];
  }
}

/**
 * Returns a URL for a tag badge (e.g., for shields.io)
 * 
 * @param tag - Tag name
 * @returns URL for the tag badge
 */
export function getTagBadgeUrl(tag: string): string {
  // Using shields.io for generating badges
  const color = getTagColor(tag);
  return `https://img.shields.io/badge/${encodeURIComponent(tag)}-${color}?style=flat-square`;
}

/**
 * Helper function to assign a color to a tag based on its name
 */
function getTagColor(tag: string): string {
  const tagLower = tag.toLowerCase();
  
  if (tagLower.startsWith('v') || tagLower.includes('release')) {
    return 'blue';
  } else if (tagLower.includes('fix') || tagLower.includes('bug')) {
    return 'red';
  } else if (tagLower.includes('feature')) {
    return 'green';
  } else if (tagLower.includes('doc')) {
    return 'purple';
  } else if (tagLower.includes('test')) {
    return 'yellow';
  } else {
    return 'gray';
  }
} 