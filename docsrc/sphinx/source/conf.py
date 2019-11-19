# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = "Sites improvement collection"
copyright = "2019, Lisin D.A."
author = "Lisin D.A."

# The full version, including alpha/beta/rc tags
release = "1.0.0"


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = ["sphinx_js", "sphinx.ext.githubpages"]

# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []

# Custom domain of Github Pages
html_baseurl = "dlisin.tk"


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
html_theme = "sphinx_rtd_theme"

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
STATIC_DIR = "_static"
html_static_path = [STATIC_DIR]

# The name of an image file (relative to this directory) to use as a favicon of
# the docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
html_favicon = f"{STATIC_DIR}/favicon.ico"

# -- Extensions configuration ------------------------------------------------

# Relative to sphinx root folder paths to js-files for jsdoc util
js_source_path = ["../../tampermonkey/easy_redmine"]
# Path to resolve pathnames in docs
root_for_relative_js_paths = "../../tampermonkey"
# Relative to 'conf.py' folder path to jsdoc config file
jsdoc_config_path = "../../jsdoc_conf.json"

# -- Document configuration --------------------------------------------------

# File with toctree
master_doc = "index"

# Include custom roles in each file of docs
rst_prolog = open("global_roles.rst", "r").read()

# Excludes from build and analyze
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store", ".git", "global_roles.rst"]
