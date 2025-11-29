# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mini', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='phone',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
