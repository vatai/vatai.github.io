// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "journal paper, conference paper, posters",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-talks",
          title: "talks",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/talks/";
          },
        },{id: "post-making-tadashi-into-a-python-package",
      
        title: "Making Tadashi into a Python package",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/making-tadashi-into-a-python-package/";
        
      },
    },{id: "post-a-post-with-image-galleries",
      
        title: "a post with image galleries",
      
      description: "this is what included image galleries could look like",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/photo-gallery/";
        
      },
    },{id: "post-draft-flattening-loops-of-combinations-again",
      
        title: "[DRAFT] Flattening loops of combinations, again!?",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/flattening-loops-again/";
        
      },
    },{id: "post-flattening-loops-of-combinations",
      
        title: "Flattening loops of combinations",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/flattening-loops-of-combinations/";
        
      },
    },{id: "post-continuous-benchmarking-on-supercomputers",
      
        title: "Continuous benchmarking on supercomputers",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2022/continuous-benchmarking-on-supercomputers/";
        
      },
    },{id: "post-polyhedral-compilation-part-1",
      
        title: "Polyhedral compilation: part 1",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2022/polyhedral-compilation-part-1/";
        
      },
    },{id: "post-installing-pytorch-with-mpi-support-on-abci",
      
        title: "Installing PyTorch with MPI support on ABCI",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2021/Installing-PyTorch-with-MPI-support-on-ABCI/";
        
      },
    },{id: "post-how-to-set-up-a-website-like-this-part-2",
      
        title: "How to set up a website like this part 2",
      
      description: "Old post about setting up Minimal Mistakes Jekyll theme (which I&#39;m not using anymore)",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2020/Setting-up-this-website-part-2/";
        
      },
    },{id: "post-how-to-set-up-a-website-like-this",
      
        title: "How to set up a website like this",
      
      description: "Old post about setting up Minimal Mistakes Jekyll theme (which I&#39;m not using anymore)",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2020/Setting-up-this-website/";
        
      },
    },{id: "post-my-first-post",
      
        title: "My first post",
      
      description: "Short (test) post",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2020/My-first-post/";
        
      },
    },{id: "news-i-switched-to-al-folio-jekyll-template-migration-is-still-in-progress",
          title: 'I switched to al-folio Jekyll template. Migration is still in progress.',
          description: "",
          section: "News",},{id: "news-the-migration-to-al-folio-is-mostly-done",
          title: 'The migration to al-folio is mostly done.',
          description: "",
          section: "News",},{id: "projects-tadashi",
          title: 'Tadashi',
          description: "Enabling AI-Based Automated Code Generation With Guaranteed Correctness",
          section: "Projects",handler: () => {
              window.location.href = "/projects/tadashi/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
