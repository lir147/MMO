from setuptools import setup, find_packages

setup(
    name='mmo_project',
    version='0.1',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=[],
    entry_points={
        'console_scripts': [
            'mmo_project = mmo_project.main:main',
        ],
    },
)
