#!/usr/bin/env python
# coding: utf8

"""
    Entrypoint provider for performing source separation.

    USAGE: python -m spleeter separate \
        -p /path/to/params \
        -i inputfile1 inputfile2 ... inputfilen
        -o /path/to/output/dir \
        -i /path/to/audio1.wav /path/to/audio2.mp3
"""

from ..audio.adapter import get_audio_adapter
from ..separator import Separator

__email__ = 'spleeter@deezer.com'
__author__ = 'Deezer Research'
__license__ = 'MIT License'



def entrypoint(arguments, params):
    """ Command entrypoint.

    :param arguments: Command line parsed argument as argparse.Namespace.
    :param params: Deserialized JSON configuration file provided in CLI args.
    """
    # TODO: check with output naming.
    separator = Separator(
        arguments.configuration,)
    for filename in arguments.inputs:
        separator.separate_to_file(
            filename,
            arguments.output_path,
        )
    separator.join()
