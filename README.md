# Computer Science — Python Homework

Welcome to the course homework repository! You will write your Python homework on your own computer, save it in your **fork** of this repository, and submit it to your teacher using a **Pull Request (PR)**.

> **Important:** Work in your own fork, not directly in the teacher's repository. Submit **one Pull Request per homework assignment**.

## 1. Set up your computer (once)

1. **Create a GitHub account** at [github.com](https://github.com/) if you do not already have one. Choose a recognizable username and remember your login.
2. **Install Python** from [python.org/downloads](https://www.python.org/downloads/). Check that it works by opening a terminal and running `python --version` (on some computers, use `python3 --version` or `py --version`).
3. **Install Git** from [git-scm.com/downloads](https://git-scm.com/downloads). Git tracks changes to your files. VS Code uses the installed Git program.
4. **Install Visual Studio Code (VS Code)** from [code.visualstudio.com](https://code.visualstudio.com/).
5. Open VS Code, select **Extensions** (the blocks icon on the left), and install:
   - **Python** (publisher: Microsoft) — for writing and running Python code.
   - **GitHub Pull Requests** (publisher: GitHub) — for creating and viewing Pull Requests inside VS Code. In some places it is called **GitHub Pull Requests and Issues**.
6. **Sign in to GitHub in VS Code** when prompted. You may also use the Accounts icon in VS Code to sign in. Authorize the GitHub login in your browser.
7. Open a terminal in VS Code (**Terminal → New Terminal**). If Git asks you to configure your identity, run the following commands, using your own name and the email address associated with your GitHub account:

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```

   These settings identify your commits; they do not sign you in to GitHub.

> **Tip:** You can use **View → Command Palette** in VS Code (or `Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS) to find commands by name.

## 2. Fork the course repository (once)

A **fork** is your own copy of the teacher's repository on GitHub.

1. Open **this course repository** on GitHub.
2. Click **Fork** (near the upper-right corner).
3. Choose your own GitHub account as the owner, then click **Create fork**.
4. You should now be viewing a repository under **your own GitHub username**.

Do not create a completely new, unrelated repository. Use **Fork** so GitHub knows where your submission belongs.

## 3. Clone your fork into VS Code (once)

A **clone** is a local copy of your GitHub repository on your computer.

1. In your fork on GitHub, click the green **Code** button and copy the **HTTPS** URL. It should look like `https://github.com/YOUR-USERNAME/REPOSITORY-NAME.git`.
2. In VS Code, open **View → Command Palette** and select **Git: Clone**.
3. Paste your fork's URL and choose a folder on your computer in which to save it.
4. When VS Code offers to open the cloned repository, click **Open**.
5. If prompted, trust the workspace **only if you recognize this course repository**.

You should now see the course files in VS Code's Explorer.

## 4. Start a new homework assignment

For **every new assignment**, use a **new branch**. A branch lets you prepare one homework without mixing it with other submissions.

1. First, make sure your local `main` branch is up to date (see **Section 7**).
2. In VS Code, click the branch name at the bottom-left of the window, or open the Command Palette and run **Git: Create Branch**.
3. Enter a short, meaningful branch name, such as `anna-petrova-homework-01`.
4. Ensure you are working on this **new branch**, not `main`.
5. Open the `homework/` folder in the VS Code Explorer. Create it if it does not exist.
6. Create your Python file inside that folder, following this exact naming pattern:

   ```text
   homework/<student-name>-<homework-name>.py
   ```

   For example:

   ```text
   homework/anna-petrova-homework-01.py
   ```

### File naming rules

- Use your name and the homework name/number in the filename.
- Use **lowercase letters** and **hyphens** (`-`) instead of spaces.
- Keep the `.py` extension.
- Put the file in `homework/`, **not in the repository's root folder**.
- Do **not edit or delete** files belonging to other students.
- Unless the teacher says otherwise, submit **one Python file per homework**.

Example repository structure:

```text
course-repository/
├── README.md
└── homework/
    ├── anna-petrova-homework-01.py
    ├── boris-ivanov-homework-01.py
    └── anna-petrova-homework-02.py
```

## 5. Write, run, and test your Python code

1. Write your solution in your new `.py` file.
2. If VS Code asks you to select a Python interpreter, choose the Python installation you set up earlier (**Python: Select Interpreter** in the Command Palette).
3. Run your file using the **Run Python File** button in the editor, or open the VS Code terminal and type:

   ```bash
   python homework/anna-petrova-homework-01.py
   ```

   Replace the filename with yours. On some computers, use `python3` or `py` instead of `python`.
4. Check that your program produces the expected results, including for different inputs if applicable.
5. Save your work (`Ctrl+S`, or `Cmd+S` on macOS).

## 6. Submit homework with a Pull Request

A **commit** saves a snapshot of your changes in Git. A **push** uploads your commits to GitHub. A **Pull Request** asks your teacher to review your work and consider adding it to the course repository.

### A. Commit your changes

1. In VS Code, open **Source Control** (the branching icon on the left).
2. Review the files listed under **Changes**. Make sure you have changed only the intended homework file(s).
3. Click the `+` beside your homework file to **stage** it (or select the desired files and choose **Stage Changes**).
4. Enter a short commit message, for example `Add Anna's homework 01`.
5. Click **Commit**.

### B. Push your branch to GitHub

1. Click **Publish Branch** (for a branch that has not been uploaded before). On later changes, use **Push** or **Sync Changes**, as appropriate.
2. Confirm that the destination is **your fork** on GitHub.
3. Wait for the upload to finish, then check your fork on GitHub if you are unsure.

### C. Create the Pull Request

**Recommended method: in GitHub (browser)**

1. Open **your fork** on GitHub.
2. GitHub may show a **Compare & pull request** banner for your recently pushed branch. Click it. If there is no banner, open **Pull requests → New pull request** and select the branches.
3. Check these two things carefully:
   - **Base repository:** the **teacher's original course repository**, base branch `main` (or the branch your teacher specifies).
   - **Head repository:** **your fork**, compare branch **your homework branch** (for example, `anna-petrova-homework-01`).
4. Enter a clear title, such as `Homework 01 — Anna Petrova`.
5. In the description, briefly describe what you implemented and mention anything that does not work yet.
6. Check the **Files changed** tab: it should contain only the intended homework changes.
7. Click **Create pull request**.

**Alternative: in VS Code**

With the **GitHub Pull Requests** extension installed, open its Pull Requests view or run **GitHub Pull Requests: Create Pull Request** from the Command Palette. Select the teacher's repository and `main` as the **base**, and your fork's homework branch as the **compare/head** branch. Review the changes, add a title and description, and create the PR.

> **A push is NOT a submission by itself.** Your homework is submitted only when you have opened a Pull Request **to the teacher's original repository**. Copy the PR link if your teacher asks you to share it.

## 7. Before your next assignment: update your fork

The teacher may add examples, instructions, or files after you created your fork. Synchronize before starting new homework.

1. Make sure your current work is saved and committed, and that you are not in the middle of editing a homework branch.
2. Open **your fork** on GitHub and switch to its **`main`** branch.
3. Click **Sync fork → Update branch** to bring the teacher's latest `main` changes into your fork. If GitHub reports conflicts, ask for help rather than discarding changes.
4. In VS Code, switch back to your **local `main`** branch (click the branch name at the bottom-left).
5. In **Source Control → `...` menu**, select **Pull** (or run **Git: Pull** from the Command Palette) to download the updated `main` from your fork.
6. Now create a **new branch from `main`** for the next homework, following Section 4.

Do not reuse your previous homework branch for a new assignment.

## 8. What if your teacher asks for corrections?

You **do not need to create a new Pull Request** for corrections to an existing homework.

1. In VS Code, switch back to the **same homework branch** used for that PR.
2. Make the requested corrections and test your code.
3. **Stage → Commit → Push** your new changes.
4. GitHub automatically adds those commits to the **existing Pull Request**.
5. Reply to your teacher's comments if needed.

Do **not** close and recreate the PR unless the teacher specifically asks you to.

## Submission checklist

Before submitting, verify:

- [ ] I worked in **my own fork**.
- [ ] I created a **new branch** for this homework.
- [ ] My Python file is inside `homework/`.
- [ ] My filename follows `<student-name>-<homework-name>.py`.
- [ ] My Python program runs and I have tested it.
- [ ] I committed and pushed my changes to **my fork**.
- [ ] I opened a Pull Request to the **teacher's repository**, not my own fork.
- [ ] My Pull Request includes only files needed for this assignment.

## Common problems

| Problem | What to do |
| --- | --- |
| **Git is not found** | Install Git and restart VS Code. |
| **Python is not found** | Install Python; select the correct interpreter in VS Code; try `python3` or `py`. |
| **VS Code wants me to sign in** | Sign in with your GitHub account and complete browser authorization. |
| **I cannot push to the teacher's repository** | That is expected. Push to **your own fork**, then create a Pull Request. |
| **My PR has files from another assignment** | Make sure each homework begins on a **new branch from updated `main`**, not from an older homework branch. |
| **I fixed something after opening my PR** | Commit and push to the **same branch**; the existing PR updates automatically. |
| **My fork is behind the teacher's repo** | Use **Sync fork → Update branch** on GitHub, then **Pull** in VS Code on your local `main`. |

## More help

- [VS Code: GitHub integration](https://code.visualstudio.com/docs/sourcecontrol/github)
- [VS Code: Source Control quickstart](https://code.visualstudio.com/docs/sourcecontrol/quickstart)
- [GitHub: Forking a repository](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo)
- [GitHub: Creating a Pull Request from a fork](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)
- [GitHub: Syncing a fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/syncing-a-fork)
