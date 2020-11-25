#!/usr/bin/env python
# coding: utf8

""" This modules provides spleeter command as well as CLI parsing methods. """

import json
import logging
from argparse import ArgumentParser
from tempfile import gettempdir
from os.path import exists, join

__email__ = 'spleeter@deezer.com'
__author__ = 'Deezer Research'
__license__ = 'MIT License'



# -i opt specification (separate).
OPT_INPUT = {
    'dest': 'inputs',
    'nargs': '+',
    'help': 'List of input audio filenames',
    'required': True
}

# -o opt specification (evaluate and separate).
OPT_OUTPUT = {
    'dest': 'output_path',
    'default': './spleeter_output',
    'help': 'Path of the output directory to write audio files in'
}

# -p opt specification (train, evaluate and separate).
OPT_PARAMS = {
    'dest': 'configuration',
    'default': 'spleeter:2stems',
    'type': str,
    'action': 'store',
    'help': 'JSON filename that contains params'
}

def create_argument_parser():
    """ Creates overall command line parser for Spleeter.

    :returns: Created argument parser.
    """
    parser = ArgumentParser(prog='spleeter')
    parser.add_argument('-p', '--params_filename', **OPT_PARAMS)
    parser.add_argument('-i', '--inputs', **OPT_INPUT)
    parser.add_argument('-o', '--output_path', **OPT_OUTPUT)
    return parser
